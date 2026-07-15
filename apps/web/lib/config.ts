/**
 * Environment configuration with validation
 * Ensures all required environment variables are present at startup.
 * Schema + validation live in ./env (zod); this module is the typed surface
 * the app imports.
 */

import { env } from './env';

/**
 * Type-safe application configuration
 * All values are validated and guaranteed to exist
 */
export const config = {
  backend: {
    // NEXT_PUBLIC_ vars are inlined into client bundles at build time, so read
    // process.env directly for the value; zod (lib/env.ts) enforces presence
    // and shape server-side at startup.
    url: process.env.NEXT_PUBLIC_BACKEND_URL!,
  },
  frontend: {
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
  logging: {
    level: env.LOG_LEVEL ?? 'info',
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Helper to check if we're running on the client
 */
export const isClient = typeof window !== 'undefined';

/**
 * Helper to check if we're running on the server
 */
export const isServer = typeof window === 'undefined';

export default config;
