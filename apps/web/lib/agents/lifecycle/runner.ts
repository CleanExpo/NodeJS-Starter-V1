/**
 * Lifecycle Command Runner
 *
 * CLI-style execution engine for lifecycle commands.
 * Machine-optimized with minimal overhead.
 */

import type { Cmd, LifecycleCtx, Phase, Res } from "./types";
import { OK, ERR, ok, err } from "./types";
import { createMemStore } from "./memory";
import { devCmds } from "./cmds/dev";
import { specCmds } from "./cmds/spec";
import { buildCmds } from "./cmds/build";
import { designCmds } from "./cmds/design";
import { archCmds } from "./cmds/arch";
import { prodCmds } from "./cmds/prod";

// ============================================================================
// Command Registry
// ============================================================================

type AnyCmd = Cmd<unknown, unknown>;

const registry = new Map<string, AnyCmd>();

// Register all commands
const allCmds: AnyCmd[] = [
  ...devCmds,
  ...specCmds,
  ...buildCmds,
  ...designCmds,
  ...archCmds,
  ...prodCmds,
];

for (const cmd of allCmds) {
  registry.set(cmd.name, cmd);
}

// ============================================================================
// Runner
// ============================================================================

export interface RunnerOpts {
  cwd?: string;
  memPath?: string;
  phase?: Phase;
  silent?: boolean;
}

export interface Runner {
  run<O>(name: string, input?: unknown): Promise<Res<O>>;
  batch(cmds: Array<{ name: string; input?: unknown }>): Promise<Res<unknown>[]>;
  list(phase?: Phase): string[];
  ctx: LifecycleCtx;
}

/**
 * Create a lifecycle command runner
 */
export function createRunner(opts: RunnerOpts = {}): Runner {
  const cwd = opts.cwd || process.cwd();
  const memPath = opts.memPath || ".agent-memory";
  const mem = createMemStore(memPath);

  const ctx: LifecycleCtx = {
    cwd,
    mem,
    phase: opts.phase || "dev",
    ts: Date.now(),
  };

  return {
    ctx,

    async run<O>(name: string, input?: unknown): Promise<Res<O>> {
      const cmd = registry.get(name);
      if (!cmd) {
        return err(`cmd:not-found:${name}`);
      }

      // Validate phase
      if (opts.phase && !cmd.phase.includes(opts.phase)) {
        return err(`cmd:phase-mismatch:${name}`, { expected: cmd.phase, got: opts.phase });
      }

      // Validate input
      const parsed = cmd.schema.safeParse(input ?? {});
      if (!parsed.success) {
        return err(`cmd:invalid-input:${name}`, { errors: parsed.error.flatten() });
      }

      try {
        const result = await cmd.exec(parsed.data, ctx);
        return result as Res<O>;
      } catch (e) {
        return err(`cmd:exec-failed:${name}`, { error: String(e) });
      }
    },

    async batch(cmds: Array<{ name: string; input?: unknown }>): Promise<Res<unknown>[]> {
      const results: Res<unknown>[] = [];

      for (const { name, input } of cmds) {
        const result = await this.run(name, input);
        results.push(result);

        // Stop on error unless explicitly continuing
        if (result.code === ERR) break;
      }

      return results;
    },

    list(phase?: Phase): string[] {
      if (!phase) return Array.from(registry.keys()).sort();

      return allCmds
        .filter((cmd) => cmd.phase.includes(phase))
        .map((cmd) => cmd.name)
        .sort();
    },
  };
}

// ============================================================================
// CLI Parser
// ============================================================================

interface ParsedCmd {
  name: string;
  args: Record<string, unknown>;
}

/**
 * Parse CLI-style command string
 *
 * Examples:
 *   "dev:init"
 *   "dev:init --name=myapp"
 *   "spec:new --id=001 --type=feature"
 *   "build:run --clean"
 */
export function parseCmd(input: string): ParsedCmd | null {
  const parts = input.trim().split(/\s+/);
  if (parts.length === 0) return null;

  const name = parts[0];
  if (!name.includes(":")) return null;

  const args: Record<string, unknown> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith("--")) {
      const [key, ...rest] = part.slice(2).split("=");
      const value = rest.join("=");

      if (value === "" || value === "true") {
        args[key] = true;
      } else if (value === "false") {
        args[key] = false;
      } else if (/^\d+$/.test(value)) {
        args[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        args[key] = parseFloat(value);
      } else if (value.startsWith("[") || value.startsWith("{")) {
        try {
          args[key] = JSON.parse(value);
        } catch {
          args[key] = value;
        }
      } else {
        args[key] = value;
      }
    }
  }

  return { name, args };
}

/**
 * Execute CLI command string
 */
export async function execCmd(
  input: string,
  opts: RunnerOpts = {}
): Promise<Res<unknown>> {
  const parsed = parseCmd(input);
  if (!parsed) {
    return err("cli:parse-failed", { input });
  }

  const runner = createRunner(opts);
  return runner.run(parsed.name, parsed.args);
}

// ============================================================================
// Pipeline
// ============================================================================

export interface Pipeline {
  add(name: string, input?: unknown): Pipeline;
  addIf(condition: boolean, name: string, input?: unknown): Pipeline;
  run(): Promise<Res<unknown>[]>;
  runUntilError(): Promise<Res<unknown>[]>;
}

/**
 * Create command pipeline for sequential execution
 */
export function createPipeline(opts: RunnerOpts = {}): Pipeline {
  const cmds: Array<{ name: string; input?: unknown }> = [];
  const runner = createRunner(opts);

  return {
    add(name: string, input?: unknown): Pipeline {
      cmds.push({ name, input });
      return this;
    },

    addIf(condition: boolean, name: string, input?: unknown): Pipeline {
      if (condition) cmds.push({ name, input });
      return this;
    },

    async run(): Promise<Res<unknown>[]> {
      const results: Res<unknown>[] = [];
      for (const { name, input } of cmds) {
        results.push(await runner.run(name, input));
      }
      return results;
    },

    async runUntilError(): Promise<Res<unknown>[]> {
      return runner.batch(cmds);
    },
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get command info
 */
export function getCmd(name: string): AnyCmd | undefined {
  return registry.get(name);
}

/**
 * Check if command exists
 */
export function hasCmd(name: string): boolean {
  return registry.has(name);
}

/**
 * Get all commands for a phase
 */
export function getCmdsByPhase(phase: Phase): AnyCmd[] {
  return allCmds.filter((cmd) => cmd.phase.includes(phase));
}

/**
 * Get command count
 */
export function getCmdCount(): number {
  return registry.size;
}

/**
 * Format result for output
 */
export function formatRes(res: Res<unknown>): string {
  if (res.code === OK) {
    return JSON.stringify(res.data, null, 2);
  }
  return `ERR: ${res.msg}${res.data ? "\n" + JSON.stringify(res.data, null, 2) : ""}`;
}
