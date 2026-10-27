import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | null | undefined;

export function isStripeConfigured(): boolean {
  return env.STRIPE_SECRET_KEY.trim().startsWith("sk_");
}

export function getStripe(): Stripe | null {
  if (stripeClient !== undefined) {
    return stripeClient;
  }

  const key = env.STRIPE_SECRET_KEY.trim();
  if (!key.startsWith("sk_")) {
    stripeClient = null;
    return null;
  }

  stripeClient = new Stripe(key, { typescript: true });
  return stripeClient;
}
