/**
 * Orchestrator Context
 *
 * Execution environment for orchestrator commands.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { glob as globFn } from "glob";
import type { OrchestratorCtx, OrchestratorState, OrchestratorConfig, Phase, GitConfig } from "./types";
import { CODE } from "./types";

const execAsync = promisify(exec);

const DEFAULT_GIT_CONFIG: GitConfig = {
  remote: "origin",
  mainBranch: "main",
  protectedBranches: ["main", "master", "develop"],
  branchPrefix: "auto/",
  commitPrefix: true,
  autoMerge: false,
};

const DEFAULT_CONFIG: OrchestratorConfig = {
  autoFix: true,
  createBackup: true,
  strictMode: false,
  branchOnChange: true,
  runTests: true,
  runLint: true,
  commitStyle: "conventional",
};

const STATE_FILE = ".orchestrator/state.json";

/**
 * Create orchestrator context
 */
export function createContext(cwd: string): OrchestratorCtx {
  let state = loadState(cwd);

  const ctx: OrchestratorCtx = {
    cwd,
    state,

    async exec(cmd: string, opts = {}) {
      const timeout = opts.timeout || 120000;
      try {
        const { stdout, stderr } = await execAsync(cmd, {
          cwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024,
        });
        return { stdout, stderr, code: 0 };
      } catch (e: unknown) {
        const error = e as { stdout?: string; stderr?: string; code?: number };
        return {
          stdout: error.stdout || "",
          stderr: error.stderr || String(e),
          code: error.code || 1,
        };
      }
    },

    async read(path: string) {
      const fullPath = join(cwd, path);
      if (!existsSync(fullPath)) return null;
      try {
        return readFileSync(fullPath, "utf-8");
      } catch {
        return null;
      }
    },

    async write(path: string, content: string) {
      const fullPath = join(cwd, path);
      const dir = dirname(fullPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(fullPath, content);
    },

    async exists(path: string) {
      return existsSync(join(cwd, path));
    },

    async glob(pattern: string) {
      return globFn(pattern, { cwd, ignore: ["**/node_modules/**", "**/.git/**"] });
    },

    log(level, msg) {
      const prefix = { info: "→", warn: "⚠", error: "✗" }[level];
      console.log(`${prefix} ${msg}`);
    },
  };

  return ctx;
}

/**
 * Load state from disk
 */
function loadState(cwd: string): OrchestratorState {
  const path = join(cwd, STATE_FILE);

  if (existsSync(path)) {
    try {
      return JSON.parse(readFileSync(path, "utf-8"));
    } catch {
      // Fall through to default
    }
  }

  return {
    phase: "init",
    project: null,
    audit: null,
    git: { ...DEFAULT_GIT_CONFIG },
    branches: [],
    activeBranch: null,
    history: [],
    config: { ...DEFAULT_CONFIG },
  };
}

/**
 * Save state to disk
 */
export function saveState(ctx: OrchestratorCtx): void {
  const path = join(ctx.cwd, STATE_FILE);
  const dir = dirname(path);

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(ctx.state, null, 2));
}

/**
 * Update state phase
 */
export function setPhase(ctx: OrchestratorCtx, phase: Phase): void {
  ctx.state.phase = phase;
  ctx.state.history.push({ action: `phase:${phase}`, ts: Date.now(), result: CODE.OK });
  saveState(ctx);
}

/**
 * Log action to history
 */
export function logAction(ctx: OrchestratorCtx, action: string, result: number): void {
  ctx.state.history.push({ action, ts: Date.now(), result });
  saveState(ctx);
}

/**
 * Get current branch
 */
export async function getCurrentBranch(ctx: OrchestratorCtx): Promise<string | null> {
  const { stdout, code } = await ctx.exec("git rev-parse --abbrev-ref HEAD");
  if (code !== 0) return null;
  return stdout.trim();
}

/**
 * Check if on protected branch
 */
export async function isProtectedBranch(ctx: OrchestratorCtx): Promise<boolean> {
  const branch = await getCurrentBranch(ctx);
  if (!branch) return false;
  return ctx.state.git.protectedBranches.includes(branch);
}

/**
 * Ensure not on protected branch
 */
export async function ensureSafeBranch(ctx: OrchestratorCtx): Promise<{ safe: boolean; branch: string | null }> {
  const branch = await getCurrentBranch(ctx);
  if (!branch) return { safe: false, branch: null };

  if (ctx.state.git.protectedBranches.includes(branch)) {
    return { safe: false, branch };
  }

  return { safe: true, branch };
}
