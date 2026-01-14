/**
 * Mode System
 *
 * Controls execution mode across the entire orchestrator.
 * Demo mode works without API keys using mock responses.
 *
 * Modes:
 * - demo: AI simulated, no external calls, safe for testing
 * - dev: Local development with optional real APIs
 * - staging: Pre-production validation
 * - prod: Full production with all security enabled
 */

import { z } from "zod";

// ============================================================================
// Mode Types
// ============================================================================

export type Mode = "demo" | "dev" | "staging" | "prod";

export interface ModeConfig {
  mode: Mode;
  aiEnabled: boolean;
  externalCalls: boolean;
  mockResponses: boolean;
  strictValidation: boolean;
  auditLogging: boolean;
  secretsRequired: string[];
  features: {
    autoFix: boolean;
    autoPush: boolean;
    autoMerge: boolean;
    notifications: boolean;
    telemetry: boolean;
  };
}

// ============================================================================
// Mode Configurations
// ============================================================================

const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  demo: {
    mode: "demo",
    aiEnabled: false,
    externalCalls: false,
    mockResponses: true,
    strictValidation: false,
    auditLogging: false,
    secretsRequired: [],
    features: {
      autoFix: true,
      autoPush: false,
      autoMerge: false,
      notifications: false,
      telemetry: false,
    },
  },
  dev: {
    mode: "dev",
    aiEnabled: true,
    externalCalls: true,
    mockResponses: false,
    strictValidation: false,
    auditLogging: false,
    secretsRequired: [],
    features: {
      autoFix: true,
      autoPush: false,
      autoMerge: false,
      notifications: false,
      telemetry: false,
    },
  },
  staging: {
    mode: "staging",
    aiEnabled: true,
    externalCalls: true,
    mockResponses: false,
    strictValidation: true,
    auditLogging: true,
    secretsRequired: ["DATABASE_URL"],
    features: {
      autoFix: true,
      autoPush: true,
      autoMerge: false,
      notifications: true,
      telemetry: true,
    },
  },
  prod: {
    mode: "prod",
    aiEnabled: true,
    externalCalls: true,
    mockResponses: false,
    strictValidation: true,
    auditLogging: true,
    secretsRequired: [
      "DATABASE_URL",
      "JWT_SECRET_KEY",
      "ENCRYPTION_KEY",
    ],
    features: {
      autoFix: false, // Require manual approval in prod
      autoPush: false,
      autoMerge: false,
      notifications: true,
      telemetry: true,
    },
  },
};

// ============================================================================
// Current Mode State
// ============================================================================

let currentMode: Mode = "demo";
let currentConfig: ModeConfig = MODE_CONFIGS.demo;

/**
 * Get current mode
 */
export function getMode(): Mode {
  return currentMode;
}

/**
 * Get current mode configuration
 */
export function getModeConfig(): ModeConfig {
  return currentConfig;
}

/**
 * Set mode
 */
export function setMode(mode: Mode): ModeConfig {
  currentMode = mode;
  currentConfig = { ...MODE_CONFIGS[mode] };
  return currentConfig;
}

/**
 * Check if in demo mode
 */
export function isDemo(): boolean {
  return currentMode === "demo";
}

/**
 * Check if in production mode
 */
export function isProd(): boolean {
  return currentMode === "prod";
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof ModeConfig["features"]): boolean {
  return currentConfig.features[feature];
}

// ============================================================================
// Secret Validation
// ============================================================================

export interface SecretStatus {
  name: string;
  required: boolean;
  present: boolean;
  masked: string;
}

/**
 * Check required secrets for current mode
 */
export function checkSecrets(): { ready: boolean; secrets: SecretStatus[] } {
  const secrets: SecretStatus[] = [];
  const required = currentConfig.secretsRequired;

  // Always check common secrets
  const allSecrets = [
    ...required,
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "GITHUB_TOKEN",
    "STRIPE_SECRET_KEY",
    "DATABASE_URL",
    "JWT_SECRET_KEY",
  ];

  const unique = [...new Set(allSecrets)];

  for (const name of unique) {
    const value = process.env[name];
    const isRequired = required.includes(name);

    secrets.push({
      name,
      required: isRequired,
      present: !!value,
      masked: value ? `${value.slice(0, 4)}...${value.slice(-4)}` : "(not set)",
    });
  }

  const ready = required.every((name) => !!process.env[name]);

  return { ready, secrets };
}

/**
 * Validate mode can be activated
 */
export function validateMode(mode: Mode): { valid: boolean; missing: string[] } {
  const config = MODE_CONFIGS[mode];
  const missing: string[] = [];

  for (const secret of config.secretsRequired) {
    if (!process.env[secret]) {
      missing.push(secret);
    }
  }

  return { valid: missing.length === 0, missing };
}

// ============================================================================
// Mode Transition
// ============================================================================

export interface TransitionResult {
  success: boolean;
  from: Mode;
  to: Mode;
  warnings: string[];
  blockers: string[];
}

/**
 * Transition to new mode with validation
 */
export function transitionTo(targetMode: Mode): TransitionResult {
  const from = currentMode;
  const warnings: string[] = [];
  const blockers: string[] = [];

  // Validate secrets
  const { valid, missing } = validateMode(targetMode);
  if (!valid) {
    blockers.push(`Missing required secrets: ${missing.join(", ")}`);
  }

  // Mode-specific checks
  if (targetMode === "prod") {
    if (from === "demo") {
      warnings.push("Transitioning directly from demo to prod is not recommended");
    }

    // Check for common production issues
    if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
      warnings.push("NODE_ENV is not set to 'production'");
    }
  }

  if (blockers.length > 0) {
    return { success: false, from, to: targetMode, warnings, blockers };
  }

  setMode(targetMode);
  return { success: true, from, to: targetMode, warnings, blockers };
}

// ============================================================================
// Mock Responses (Demo Mode)
// ============================================================================

export const MOCK_RESPONSES = {
  aiComplete: (prompt: string) => ({
    content: `[DEMO MODE] AI response for: "${prompt.slice(0, 50)}..."`,
    model: "demo-model",
    usage: { input: 0, output: 0 },
  }),

  aiEmbed: (text: string) => ({
    embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5),
    model: "demo-embedding",
  }),

  httpFetch: (url: string) => ({
    status: 200,
    ok: true,
    data: { demo: true, url },
  }),

  dbQuery: (query: string) => ({
    rows: [],
    count: 0,
    demo: true,
  }),
};

/**
 * Get mock response if in demo mode
 */
export function getMock<T extends keyof typeof MOCK_RESPONSES>(
  type: T,
  ...args: Parameters<(typeof MOCK_RESPONSES)[T]>
): ReturnType<(typeof MOCK_RESPONSES)[T]> | null {
  if (!currentConfig.mockResponses) return null;
  const fn = MOCK_RESPONSES[type] as (...args: unknown[]) => unknown;
  return fn(...args) as ReturnType<(typeof MOCK_RESPONSES)[T]>;
}

// ============================================================================
// Schema
// ============================================================================

export const ModeSchema = z.enum(["demo", "dev", "staging", "prod"]);
