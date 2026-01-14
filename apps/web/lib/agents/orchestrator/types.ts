/**
 * Orchestrator Types
 *
 * Core types for autonomous codebase management.
 */

import { z } from "zod";

// ============================================================================
// Response Codes
// ============================================================================

export const CODE = {
  OK: 0,
  ERR: 1,
  WARN: 2,
  SKIP: 3,
  BLOCKED: 4,
  PENDING: 5,
} as const;

export type Code = (typeof CODE)[keyof typeof CODE];

export interface Res<T = unknown> {
  code: Code;
  data?: T;
  msg?: string;
  ts: number;
}

export const ok = <T>(data: T): Res<T> => ({ code: CODE.OK, data, ts: Date.now() });
export const err = (msg: string, data?: unknown): Res => ({ code: CODE.ERR, msg, data, ts: Date.now() });
export const warn = (msg: string, data?: unknown): Res => ({ code: CODE.WARN, msg, data, ts: Date.now() });
export const skip = (msg: string): Res => ({ code: CODE.SKIP, msg, ts: Date.now() });

// ============================================================================
// Project Types
// ============================================================================

export type ProjectType = "nextjs" | "react" | "node" | "python" | "monorepo" | "unknown";
export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export interface ProjectConfig {
  name: string;
  type: ProjectType;
  packageManager: PackageManager;
  root: string;
  hasTypescript: boolean;
  hasTesting: boolean;
  hasLinting: boolean;
  hasDocker: boolean;
  hasCi: boolean;
  frameworks: string[];
  entryPoints: string[];
}

// ============================================================================
// Audit Types
// ============================================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type IssueCategory = "security" | "performance" | "quality" | "deps" | "config" | "structure";

export interface Issue {
  id: string;
  category: IssueCategory;
  severity: Severity;
  title: string;
  description: string;
  file?: string;
  line?: number;
  fix?: string;
  autoFixable: boolean;
}

export interface AuditResult {
  score: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  issues: Issue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  checks: {
    security: boolean;
    performance: boolean;
    quality: boolean;
    deps: boolean;
    config: boolean;
  };
  ts: number;
}

// ============================================================================
// Branch Types
// ============================================================================

export type BranchType = "feature" | "fix" | "refactor" | "chore" | "release" | "hotfix";

export interface Branch {
  name: string;
  type: BranchType;
  base: string;
  created: number;
  description: string;
  status: "active" | "merged" | "abandoned";
}

export interface GitConfig {
  remote: string;
  mainBranch: string;
  protectedBranches: string[];
  branchPrefix: string;
  commitPrefix: boolean;
  autoMerge: boolean;
}

// ============================================================================
// Orchestrator State
// ============================================================================

export type Phase = "init" | "audit" | "cleanup" | "integrate" | "ready" | "active";

export interface OrchestratorState {
  phase: Phase;
  project: ProjectConfig | null;
  audit: AuditResult | null;
  git: GitConfig;
  branches: Branch[];
  activeBranch: string | null;
  history: Array<{
    action: string;
    ts: number;
    result: Code;
  }>;
  config: OrchestratorConfig;
}

export interface OrchestratorConfig {
  autoFix: boolean;
  createBackup: boolean;
  strictMode: boolean;
  branchOnChange: boolean;
  runTests: boolean;
  runLint: boolean;
  commitStyle: "conventional" | "semantic" | "simple";
}

// ============================================================================
// Command Types
// ============================================================================

export interface OrchestratorCtx {
  cwd: string;
  state: OrchestratorState;
  exec: (cmd: string, opts?: { timeout?: number; silent?: boolean }) => Promise<{ stdout: string; stderr: string; code: number }>;
  read: (path: string) => Promise<string | null>;
  write: (path: string, content: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  glob: (pattern: string) => Promise<string[]>;
  log: (level: "info" | "warn" | "error", msg: string) => void;
}

export interface Cmd<I = unknown, O = unknown> {
  name: string;
  description: string;
  schema: z.ZodType<I>;
  exec: (input: I, ctx: OrchestratorCtx) => Promise<Res<O>>;
}

// ============================================================================
// Schemas
// ============================================================================

export const RepoInputSchema = z.object({
  url: z.string().url().optional(),
  path: z.string().optional(),
  branch: z.string().optional(),
}).refine((d) => d.url || d.path, { message: "url or path required" });

export type RepoInput = z.infer<typeof RepoInputSchema>;

export const OnboardOptsSchema = z.object({
  autoFix: z.boolean().default(true),
  createBackup: z.boolean().default(true),
  strictMode: z.boolean().default(false),
  skipAudit: z.boolean().default(false),
  skipCleanup: z.boolean().default(false),
});

export type OnboardOpts = z.infer<typeof OnboardOptsSchema>;
