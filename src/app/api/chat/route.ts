import { NextResponse } from "next/server";
import { streamText } from "ai";
import { getActiveAIModel } from "@/services/ai/models";
import { withValidation } from "@/lib/validation/api";
import { chatRequestSchema } from "@/lib/validation/chat.schema";
import { recordUsageAndDeductCredits } from "@/services/ai/tokens";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const POST = withValidation(
  chatRequestSchema,
  async (req, data, session) => {
    const userId = session!.user!.id;
    const { messages, conversationId: requestedConversationId } = data;
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // 1. Resolve or Create Conversation Thread
    let conversationId = requestedConversationId;
    if (userId && userId !== "demo-user") {
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

        // Save User Message to DB
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
        logger.warn({ dbErr }, "Database unavailable, proceeding in memory");
      }
    }

    // 2. Resolve Active AI Provider (OpenAI)
    const activeAI = getActiveAIModel();
    if (!activeAI) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Please set OPENAI_API_KEY in your .env file." },
        { status: 400 }
      );
    }

    // 3. Stream LLM Generation
    try {
      const result = streamText({
        model: activeAI.model,
        system: `You are AI-Starter, a helpful and precise AI assistant.
Format your responses using GitHub-flavored Markdown. Provide clear, concise answers.`,
        messages: messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
        onFinish: async ({ text, usage }) => {
          try {
            if (conversationId && text && userId !== "demo-user") {
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
    } catch (err: any) {
      logger.error({ err }, "Error initializing AI stream");
      return NextResponse.json(
        { error: err?.message || "Failed to communicate with OpenAI. Please check your API key." },
        { status: 500 }
      );
    }
  }
);
