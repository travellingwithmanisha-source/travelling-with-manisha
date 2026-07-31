import { z } from "zod";

/**
 * Validates required environment variables at startup rather than
 * letting a missing var surface as a confusing runtime error deep in a
 * request (e.g. `lib/stripe.ts` currently throws its own inline check —
 * that pattern still works and wasn't rewritten here, but new code
 * should prefer importing from here so every required var is checked in
 * one place with one clear error).
 *
 * Import `env` (not `process.env` directly) in new server-only code:
 *   import { env } from "@/lib/env";
 *   env.STRIPE_SECRET_KEY
 *
 * This module is server-only — it reads secrets. Never import it from a
 * "use client" file (NEXT_PUBLIC_* vars are also re-exported here for
 * convenience, but client components should keep reading
 * `process.env.NEXT_PUBLIC_*` directly so bundling behaves as Next.js
 * expects).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),

  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  GOOGLE_MAPS_SERVER_API_KEY: z.string().min(1),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.flatten().fieldErrors;
    console.error("❌ Invalid/missing environment variables:", missing);
    throw new Error(
      "Environment validation failed — check .env.local against .env.example. See the error above for which variables are missing or malformed."
    );
  }

  return parsed.data;
}

// Skip strict validation during `next build`'s static analysis pass and
// in test runs, where secrets legitimately may not be present — only
// enforce this at actual server start / request time.
export const env =
  process.env.SKIP_ENV_VALIDATION === "true" ? (process.env as unknown as ReturnType<typeof loadEnv>) : loadEnv();
