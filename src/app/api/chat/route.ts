import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { getActiveAIModel } from "@/services/ai/models";
import { withValidation } from "@/lib/validation/api";
import {
  chatRequestSchema,
  extractMessageText,
  type ChatMessage,
} from "@/lib/validation/chat.schema";
import { getUserCredits, recordUsageAndDeductCredits } from "@/services/ai/tokens";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

function resolveChatMaxTokens(): number {
  const parsed = Number.parseInt(process.env.CHAT_MAX_TOKENS || "4096", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4096;
}

function toUIMessages(messages: ChatMessage[]): UIMessage[] {
  return messages.map((message, index) => {
    const text = extractMessageText(message);
    const parts =
      message.parts && message.parts.length > 0
        ? (message.parts as UIMessage["parts"])
        : ([{ type: "text", text }] as UIMessage["parts"]);

    return {
      id: message.id ?? `msg-${index}`,
      role: message.role,
      parts,
      ...(message.metadata !== undefined ? { metadata: message.metadata } : {}),
    } as UIMessage;
  });
}

export const POST = withValidation(
  chatRequestSchema,
  async (req, data, session) => {
    const userId = session!.user!.id;
    const { messages, conversationId: requestedConversationId } = data;
    const latestUserMessage =
      [...messages].reverse().find((m) => m.role === "user") || undefined;
    const latestUserText = latestUserMessage
      ? extractMessageText(latestUserMessage)
      : "";

    // 1. Resolve Active AI Provider (OpenAI) before charging
    const activeAI = getActiveAIModel();
    if (!activeAI) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Please set OPENAI_API_KEY in your .env file." },
        { status: 400 }
      );
    }

    // 2. Resolve or Create Conversation Thread
    let conversationId = requestedConversationId;
    try {
      if (conversationId) {
        const exists = await db.conversation.findFirst({
          where: { id: conversationId, userId },
        });
        if (!exists) conversationId = undefined;
      }

      if (!conversationId) {
        const newConv = await db.conversation.create({
          data: {
            userId,
            title: latestUserText.slice(0, 40) || "New Conversation",
          },
        });
        conversationId = newConv.id;
      }

      if (latestUserText && conversationId) {
        await db.message.create({
          data: {
            conversationId,
            role: "user",
            content: latestUserText,
          },
        });

        await db.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      }
    } catch (dbErr) {
      logger.error({ dbErr }, "Database unavailable; refusing to stream unpaid generation");
      return NextResponse.json(
        { error: "Database unavailable. Please try again.", code: "DATABASE_ERROR" },
        { status: 503 }
      );
    }

    // 3. Refuse empty wallets before calling the model
    const balance = await getUserCredits(userId);
    if (!balance.success) {
      return NextResponse.json(
        { error: balance.error.message, code: balance.code },
        { status: balance.error.statusCode }
      );
    }
    if (balance.data.credits <= 0) {
      return NextResponse.json(
        {
          error: "Insufficient credits remaining. Upgrade to Pro to continue chatting.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    const maxOutputTokens = resolveChatMaxTokens();
    const uiMessages = toUIMessages(messages);

    // 4. Stream LLM Generation
    try {
      const modelMessages = await convertToModelMessages(uiMessages);

      const result = streamText({
        model: activeAI.model,
        instructions: `You are AgenticPacks, a helpful and precise AI assistant.
Format your responses using GitHub-flavored Markdown. Provide clear, concise answers.`,
        messages: modelMessages,
        maxOutputTokens,
        abortSignal: req.signal,
        onEnd: async ({ text, totalUsage }) => {
          try {
            const promptTokens = totalUsage?.inputTokens || 0;
            const completionTokens = totalUsage?.outputTokens || 0;

            if (conversationId && text) {
              await db.message.create({
                data: {
                  conversationId,
                  role: "assistant",
                  content: text,
                  promptTokens,
                  completionTokens,
                },
              });
            }

            if (userId && totalUsage) {
              await recordUsageAndDeductCredits({
                userId,
                promptTokens,
                completionTokens,
                endpoint: "/chat",
              });
            }
          } catch (postErr) {
            logger.warn({ postErr }, "Failed in onEnd post-processing");
          }
        },
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
        headers: conversationId
          ? { "x-conversation-id": conversationId }
          : undefined,
      });
    } catch (err: unknown) {
      logger.error({ err }, "Error initializing AI stream");
      const message =
        err instanceof Error
          ? err.message
          : "Failed to communicate with OpenAI. Please check your API key.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  { requireAuth: true }
);
