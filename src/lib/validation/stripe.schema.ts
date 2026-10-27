import { z } from "zod";

export const checkoutSessionSchema = z.object({
  planId: z.literal("pro"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const customerPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
  flow: z.enum(["portal", "cancel"]).optional(),
});

export type CheckoutSessionRequest = z.infer<typeof checkoutSessionSchema>;
export type CustomerPortalRequest = z.infer<typeof customerPortalSchema>;
