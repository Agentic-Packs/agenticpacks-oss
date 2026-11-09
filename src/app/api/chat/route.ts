import { NextResponse } from "next/server";
import { streamText } from "ai";
import { getActiveAIModel } from "@/services/ai/models";
import { withValidation } from "@/lib/validation/api";
import { chatRequestSchema } from "@/lib/validation/chat.schema";
import { getUserCredits, recordUsageAndDeductCredits } from "@/services/ai/tokens";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

function resolveChatMaxTokens(): number {
  const parsed = Number.parseInt(process.env.CHAT_MAX_TOKENS || "4096", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4096;
}

export const POST = withValidation(
  chatRequestSchema,
  async (req, data, session) => {
    const userId = session!.user!.id;
    const { messages, conversationId: requestedConversationId } = data;
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

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
            title: latestUserMessage.slice(0, 40) || "New Conversation",
          },
        });
        conversationId = newConv.id;
      }

      if (latestUserMessage && conversationId) {
        await db.message.create({
          data: {
            conversationId,
            role: "user",
            content: latestUserMessage,
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

    const maxTokens = resolveChatMaxTokens();

    // 4. Stream LLM Generation
    try {
      const result = streamText({
        model: activeAI.model,
        system: `You are AgenticPacks, a helpful and precise AI assistant.
Format your responses using GitHub-flavored Markdown. Provide clear, concise answers.`,
        messages: messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
        maxTokens,
        abortSignal: req.signal,
        onFinish: async ({ text, usage }) => {
          try {
            if (conversationId && text) {
              await db.message.create({
                data: {
                  conversationId,
                  role: "assistant",
                  content: text,
                  promptTokens: usage?.promptTokens || 0,
                  completionTokens: usage?.completionTokens || 0,
                },
              });
            }

            if (userId && usage) {
              await recordUsageAndDeductCredits({
                userId,
                promptTokens: usage.promptTokens || 0,
                completionTokens: usage.completionTokens || 0,
                endpoint: "/chat",
              });
            }
          } catch (postErr) {
            logger.warn({ postErr }, "Failed in onFinish post-processing");
          }
        },
      });

      const response = result.toDataStreamResponse();
      if (conversationId) {
        response.headers.set("x-conversation-id", conversationId);
      }
      return response;
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
