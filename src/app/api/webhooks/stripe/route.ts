import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getStripe } from "@/lib/stripe";
import { handleStripeWebhookEvent } from "@/services/stripe/subscription";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET.trim();
  const signature = req.headers.get("stripe-signature");

  if (!stripe || !webhookSecret.startsWith("whsec_") || !signature) {
    logger.warn("Stripe webhook rejected: missing SDK, signing secret, or signature");
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 400 });
  }

  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const result = await handleStripeWebhookEvent(event);
    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({
      received: true,
      processed: result.data.processed,
      ...(result.data.ignored ? { ignored: true, message: result.data.reason } : {}),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    logger.error({ err }, "Stripe webhook signature verification failed");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
