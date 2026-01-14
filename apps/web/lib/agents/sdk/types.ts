/**
 * SDK Agent Types
 *
 * Common types for all SDK integration agents.
 */

import type { BaseContext } from "../core";

// ============================================================================
// SDK Context
// ============================================================================

/**
 * Base context for SDK agents with credentials
 */
export interface SDKContext extends BaseContext {
  /** API credentials (loaded from env or config) */
  credentials: {
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
  };
  /** Current project information */
  project?: {
    name: string;
    path: string;
    type: "nextjs" | "node" | "python" | "other";
  };
  /** Environment */
  environment: "development" | "staging" | "production";
}

// ============================================================================
// SDK Agent Registry Types
// ============================================================================

export type SDKAgentType =
  | "stripe"
  | "vercel"
  | "github"
  | "docker"
  | "supabase"
  | "gemini";

export interface SDKAgentInfo {
  type: SDKAgentType;
  name: string;
  description: string;
  keywords: string[];
  requiredCredentials: string[];
  optionalCredentials: string[];
}

// ============================================================================
// Tool Response Types
// ============================================================================

export interface ToolSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ToolError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ToolResponse<T = unknown> = ToolSuccess<T> | ToolError;

// ============================================================================
// Helpers
// ============================================================================

export function success<T>(data: T, message?: string): ToolSuccess<T> {
  return { success: true, data, message };
}

export function error(message: string, code?: string, details?: unknown): ToolError {
  return { success: false, error: message, code, details };
}

export function hasCredential(
  ctx: SDKContext,
  sdk: SDKAgentType,
  key: string
): boolean {
  const creds = ctx.credentials[sdk];
  if (!creds) return false;
  return key in creds && !!(creds as Record<string, unknown>)[key];
}

export function getCredential<T = string>(
  ctx: SDKContext,
  sdk: SDKAgentType,
  key: string
): T | undefined {
  const creds = ctx.credentials[sdk];
  if (!creds) return undefined;
  return (creds as Record<string, unknown>)[key] as T | undefined;
}
