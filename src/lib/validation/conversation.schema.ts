import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createConversationSchema = z.object({
  title: z.string().min(1).max(120).optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(120),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
