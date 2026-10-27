import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgrespassword@localhost:5432/ai_starter_community"),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().default("community-secret-key-32-chars-long-dev-secret"),

  // AI Provider Key (OpenAI)
  OPENAI_API_KEY: z.string().optional(),

  // Optional OAuth
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Stripe (optional until Checkout is used)
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_APP_ID: z.string().optional().default(""),

  // Logging
  LOG_LEVEL: z.string().default("info"),
});

const isBrowser = typeof window !== "undefined";
const rawAuthUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || (isBrowser ? "postgresql://localhost:5432/ai_starter_community" : undefined),
  AUTH_URL: rawAuthUrl,
  AUTH_SECRET: process.env.AUTH_SECRET || (isBrowser ? "community-secret-key-32-chars-long-dev-secret" : undefined),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_APP_ID: process.env.STRIPE_APP_ID,
  LOG_LEVEL: process.env.LOG_LEVEL,
});
