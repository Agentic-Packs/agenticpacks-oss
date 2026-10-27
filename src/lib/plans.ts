export interface PlanConfig {
  id: "free" | "pro";
  name: string;
  description: string;
  priceMonthly: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<PlanConfig["id"], PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    description: "Starter credits to try streaming chat in this boilerplate.",
    priceMonthly: 0,
    credits: 100,
    features: [
      "100 starter credits",
      "GPT-4o Mini streaming chat",
      "Conversation history",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Monthly credits for shipping a simple AI SaaS.",
    priceMonthly: 19,
    credits: 500,
    popular: true,
    features: [
      "500 AI credits each billing cycle",
      "Stripe Checkout & Customer Portal",
      "GPT-4o Mini streaming chat",
    ],
  },
};
