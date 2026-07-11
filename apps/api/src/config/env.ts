import { z } from "zod";

/**
 * WORKED EXAMPLE — study this one, you'll reuse the pattern everywhere.
 *
 * Validate process.env ONCE at boot. If a variable is missing or malformed
 * the app crashes immediately with a readable message, instead of failing
 * mysteriously on the first request 20 minutes into a debugging session.
 * After this file, nothing else in the codebase touches process.env.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),

  // Storage
  S3_BUCKET: z.string().min(1),
  S3_REGION: z.string().min(1).default("us-east-1"),
  // Only set in development (points at LocalStack). Absent in prod = real AWS.
  S3_ENDPOINT: z.string().url().optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  // Simple bearer token for the admin routes (fine for a personal tool)
  ADMIN_TOKEN: z.string().min(16, "Use at least 16 chars"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
// Note the inferred type: env.PORT is a number (z.coerce did that),
// env.S3_ENDPOINT is `string | undefined`. Hover them in your editor.
export const isDev = env.NODE_ENV === "development";
