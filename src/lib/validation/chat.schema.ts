import { z } from "zod";

const chatPartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

export const chatMessageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(["user", "assistant", "system"]),
    parts: z.array(chatPartSchema).optional(),
    content: z.string().optional(),
    metadata: z.unknown().optional(),
  })
  .refine(
    (message) => {
      if (typeof message.content === "string" && message.content.trim().length > 0) {
        return true;
      }
      return Boolean(
        message.parts?.some(
          (part) =>
            part.type === "text" &&
            typeof (part as { text?: unknown }).text === "string" &&
            String((part as { text?: unknown }).text).trim().length > 0
        )
      );
    },
    { message: "Message content cannot be empty" }
  );

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  conversationId: z.string().optional(),
  id: z.string().optional(),
  trigger: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export function extractMessageText(message: ChatMessage): string {
  if (typeof message.content === "string" && message.content.length > 0) {
    return message.content;
  }

  if (!message.parts) {
    return "";
  }

  return message.parts
    .filter(
      (part): part is { type: string; text: string } =>
        part.type === "text" && typeof (part as { text?: unknown }).text === "string"
    )
    .map((part) => part.text)
    .join("");
}
