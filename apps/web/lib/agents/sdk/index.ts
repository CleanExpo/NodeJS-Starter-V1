/**
 * SDK Integration Agents
 *
 * Pre-built agents for common service integrations:
 * - Stripe: Payment processing and subscriptions
 * - Vercel: Deployment and hosting
 * - GitHub: Repository and issue management
 * - Docker: Container management
 * - Supabase: Database and authentication
 * - Gemini: AI text and image generation
 *
 * Usage:
 * ```typescript
 * import { sdkRouterAgent, runSDKTask, createSDKContext } from '@/lib/agents/sdk';
 *
 * // Create context with credentials
 * const ctx = createSDKContext({
 *   stripe: { secretKey: process.env.STRIPE_SECRET_KEY! },
 *   github: { token: process.env.GITHUB_TOKEN! },
 * });
 *
 * // Option 1: Use the router agent (handles routing automatically)
 * const result = await runner.run(sdkRouterAgent, 'Create a Stripe customer', { context: ctx });
 *
 * // Option 2: Quick task execution
 * const { agent, output, success } = await runSDKTask('Deploy to Vercel', ctx);
 * ```
 */

// Types
export type {
  SDKContext,
  SDKAgentType,
  SDKAgentInfo,
  ToolResponse,
  ToolSuccess,
  ToolError,
} from "./types";
export { success, error, hasCredential, getCredential } from "./types";

// Individual Agents
export { stripeAgent, stripeAgentInfo } from "./stripe-agent";
export { vercelAgent, vercelAgentInfo } from "./vercel-agent";
export { githubAgent, githubAgentInfo } from "./github-agent";
export { dockerAgent, dockerAgentInfo } from "./docker-agent";
export { supabaseAgent, supabaseAgentInfo } from "./supabase-agent";
export { geminiAgent, geminiAgentInfo } from "./gemini-agent";

// Registry and Router
export {
  getAllAgents,
  getAgent,
  getAgentInfo,
  hasCredentials,
  getAvailableAgents,
  routeToAgent,
  routeToAgents,
  sdkRouterAgent,
  listSDKAgentsTool,
  routeToSDKAgentTool,
  autoRouteTool,
  runSDKTask,
  getSetupInstructions,
} from "./registry";

// ============================================================================
// Context Factory
// ============================================================================

import type { SDKContext } from "./types";
import { createContext } from "../core";

export interface SDKCredentials {
  stripe?: {
    secretKey: string;
    publishableKey?: string;
    webhookSecret?: string;
  };
  vercel?: {
    token: string;
    teamId?: string;
  };
  github?: {
    token: string;
    owner?: string;
    repo?: string;
  };
  docker?: {
    host?: string;
    socketPath?: string;
  };
  supabase?: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  gemini?: {
    apiKey: string;
    projectId?: string;
  };
}

export interface CreateSDKContextOptions {
  credentials?: Partial<SDKCredentials>;
  environment?: "development" | "staging" | "production";
  project?: {
    name: string;
    path: string;
    type: "nextjs" | "node" | "python" | "other";
  };
  userId?: string;
}

/**
 * Create an SDK context with credentials
 *
 * @example
 * ```typescript
 * // From environment variables
 * const ctx = createSDKContext({
 *   credentials: {
 *     stripe: {
 *       secretKey: process.env.STRIPE_SECRET_KEY!,
 *       webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
 *     },
 *     github: {
 *       token: process.env.GITHUB_TOKEN!,
 *       owner: 'myorg',
 *       repo: 'myrepo',
 *     },
 *     supabase: {
 *       url: process.env.SUPABASE_URL!,
 *       anonKey: process.env.SUPABASE_ANON_KEY!,
 *       serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
 *     },
 *   },
 *   environment: 'development',
 *   project: {
 *     name: 'my-app',
 *     path: '/path/to/project',
 *     type: 'nextjs',
 *   },
 * });
 * ```
 */
export function createSDKContext(options: CreateSDKContextOptions = {}): SDKContext {
  return createContext<SDKContext>({
    userId: options.userId,
    initial: {
      credentials: {
        stripe: options.credentials?.stripe,
        vercel: options.credentials?.vercel,
        github: options.credentials?.github,
        docker: options.credentials?.docker,
        supabase: options.credentials?.supabase,
        gemini: options.credentials?.gemini,
      },
      project: options.project,
      environment: options.environment || "development",
    },
  });
}

/**
 * Create SDK context from environment variables
 *
 * Automatically reads common environment variable patterns
 */
export function createSDKContextFromEnv(
  options: Omit<CreateSDKContextOptions, "credentials"> = {}
): SDKContext {
  // Helper to get env var with fallback
  const env = (key: string): string | undefined =>
    typeof process !== "undefined" ? process.env[key] : undefined;

  return createSDKContext({
    ...options,
    credentials: {
      stripe: env("STRIPE_SECRET_KEY")
        ? {
            secretKey: env("STRIPE_SECRET_KEY")!,
            publishableKey: env("STRIPE_PUBLISHABLE_KEY"),
            webhookSecret: env("STRIPE_WEBHOOK_SECRET"),
          }
        : undefined,
      vercel: env("VERCEL_TOKEN")
        ? {
            token: env("VERCEL_TOKEN")!,
            teamId: env("VERCEL_TEAM_ID"),
          }
        : undefined,
      github: env("GITHUB_TOKEN")
        ? {
            token: env("GITHUB_TOKEN")!,
            owner: env("GITHUB_OWNER"),
            repo: env("GITHUB_REPO"),
          }
        : undefined,
      docker: {
        host: env("DOCKER_HOST"),
        socketPath: env("DOCKER_SOCKET_PATH"),
      },
      supabase: env("SUPABASE_URL")
        ? {
            url: env("SUPABASE_URL")!,
            anonKey: env("SUPABASE_ANON_KEY")!,
            serviceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
          }
        : undefined,
      gemini: env("GEMINI_API_KEY")
        ? {
            apiKey: env("GEMINI_API_KEY")!,
            projectId: env("GEMINI_PROJECT_ID"),
          }
        : undefined,
    },
  });
}
