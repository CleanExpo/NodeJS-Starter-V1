/**
 * Schema-validated environment access (zod).
 *
 * Two tiers:
 * - `env` — always-required vars, parsed once at server startup (fail fast).
 * - `requireSupabaseEnv()` — feature-scoped vars, validated at first use so
 *   deployments that don't enable the feature still boot.
 *
 * Never read `process.env` directly in app code; add the var here instead so
 * a missing value fails with a named error, not `undefined` at runtime.
 */

import { z } from 'zod';

const serverEnvSchema = z.object({
  NEXT_PUBLIC_BACKEND_URL: z.string().url({
    message: 'NEXT_PUBLIC_BACKEND_URL must be a valid URL (e.g. http://localhost:8000)',
  }),
  NEXT_PUBLIC_FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

function parseServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\n` +
        `Add these to your .env.local file or deployment environment (see .env.example).`
    );
  }
  return result.data;
}

// Validate on module load, server-side only (client bundles get inlined values).
export const env =
  typeof window === 'undefined'
    ? parseServerEnv()
    : (serverEnvSchema.partial().parse({}) as z.infer<typeof serverEnvSchema>);

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be your project URL (https://<ref>.supabase.co)',
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be the anon key from your Supabase dashboard',
  }),
});

/**
 * Validated Supabase config. Throws a named error when the vars are missing —
 * there is deliberately NO fallback: a template must never default to a live
 * project's database.
 */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const result = supabaseEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Supabase is not configured for this deployment:\n${issues}\n\n` +
        `Set both vars in .env.local (see .env.example) or disable the feature that needs them.`
    );
  }
  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
