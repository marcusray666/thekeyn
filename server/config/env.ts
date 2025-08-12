import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  SESSION_SECRET: z.string().min(32).default("dev-secret-key-change-in-production"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  // Object storage environment variables will be set automatically
  PUBLIC_OBJECT_SEARCH_PATHS: z.string().optional(),
  PRIVATE_OBJECT_DIR: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

// Crash early if required env vars are missing in production
if (env.NODE_ENV === "production") {
  const productionRequired = EnvSchema.extend({
    SESSION_SECRET: z.string().min(32),
  });
  
  try {
    productionRequired.parse(process.env);
  } catch (error) {
    console.error("❌ Missing required environment variables for production:");
    console.error(error);
    process.exit(1);
  }
}