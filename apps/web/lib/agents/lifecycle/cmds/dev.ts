/**
 * dev - Development phase commands
 */

import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import type { Cmd, LifecycleCtx, Res } from "../types";
import { ok, err } from "../types";

const execAsync = promisify(exec);

// dev:init - Initialize development environment
export const devInit: Cmd<{ force?: boolean }, { steps: string[] }> = {
  name: "dev:init",
  phase: ["dev"],
  schema: z.object({ force: z.boolean().optional() }),
  async exec({ force }, ctx) {
    const steps: string[] = [];

    // Check node_modules
    if (!existsSync("node_modules") || force) {
      try {
        await execAsync("pnpm install", { cwd: ctx.cwd });
        steps.push("deps:installed");
      } catch (e) {
        return err(`deps:failed - ${e}`);
      }
    } else {
      steps.push("deps:exists");
    }

    // Check .env
    if (!existsSync(".env") && existsSync(".env.example")) {
      const example = readFileSync(".env.example", "utf-8");
      writeFileSync(".env", example);
      steps.push("env:created");
    }

    // Save init state
    await ctx.mem.set("dev:init", { ts: Date.now(), steps }, { type: "state" });

    return ok({ steps });
  },
};

// dev:start - Start dev server
export const devStart: Cmd<{ port?: number }, { pid?: number; url: string }> = {
  name: "dev:start",
  phase: ["dev"],
  schema: z.object({ port: z.number().optional() }),
  async exec({ port = 3000 }, ctx) {
    try {
      const { stdout } = await execAsync(`pnpm dev &`, { cwd: ctx.cwd });
      await ctx.mem.set("dev:server", { port, started: Date.now() }, { type: "state" });
      return ok({ url: `http://localhost:${port}` });
    } catch (e) {
      return err(`start:failed - ${e}`);
    }
  },
};

// dev:stop - Stop dev server
export const devStop: Cmd<Record<string, never>, { stopped: boolean }> = {
  name: "dev:stop",
  phase: ["dev"],
  schema: z.object({}),
  async exec(_, ctx) {
    try {
      await execAsync("pkill -f 'next dev' || true", { cwd: ctx.cwd });
      await ctx.mem.del("dev:server");
      return ok({ stopped: true });
    } catch {
      return ok({ stopped: false });
    }
  },
};

// dev:status - Get dev environment status
export const devStatus: Cmd<Record<string, never>, Record<string, unknown>> = {
  name: "dev:status",
  phase: ["dev"],
  schema: z.object({}),
  async exec(_, ctx) {
    const server = await ctx.mem.get<{ port: number; started: number }>("dev:server");
    const init = await ctx.mem.get<{ ts: number }>("dev:init");

    let deps = "unknown";
    if (existsSync("node_modules")) deps = "installed";

    return ok({
      deps,
      server: server ? { ...server, running: true } : null,
      init: init?.ts || null,
      cwd: ctx.cwd,
      env: ctx.env,
    });
  },
};

// dev:exec - Execute shell command
export const devExec: Cmd<{ cmd: string; timeout?: number }, { stdout: string; stderr: string; code: number }> = {
  name: "dev:exec",
  phase: ["dev"],
  schema: z.object({
    cmd: z.string(),
    timeout: z.number().optional(),
  }),
  async exec({ cmd, timeout = 30000 }, ctx) {
    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: ctx.cwd,
        timeout,
      });
      await ctx.mem.set(`dev:exec:${Date.now()}`, { cmd, stdout, stderr }, { type: "log", tags: ["exec"] });
      return ok({ stdout, stderr, code: 0 });
    } catch (e: unknown) {
      const error = e as { stdout?: string; stderr?: string; code?: number };
      return err(`exec:failed`, {
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        code: error.code || 1,
      });
    }
  },
};

// dev:watch - Watch file changes
export const devWatch: Cmd<{ pattern: string }, { watching: boolean }> = {
  name: "dev:watch",
  phase: ["dev"],
  schema: z.object({ pattern: z.string() }),
  async exec({ pattern }, ctx) {
    await ctx.mem.set("dev:watch", { pattern, started: Date.now() }, { type: "state" });
    return ok({ watching: true });
  },
};

// dev:lint - Run linter
export const devLint: Cmd<{ fix?: boolean }, { errors: number; warnings: number; fixed?: number }> = {
  name: "dev:lint",
  phase: ["dev"],
  schema: z.object({ fix: z.boolean().optional() }),
  async exec({ fix }, ctx) {
    try {
      const cmd = fix ? "pnpm lint --fix" : "pnpm lint";
      const { stdout, stderr } = await execAsync(cmd, { cwd: ctx.cwd });
      const output = stdout + stderr;

      const errorMatch = output.match(/(\d+)\s*error/i);
      const warnMatch = output.match(/(\d+)\s*warning/i);

      return ok({
        errors: errorMatch ? parseInt(errorMatch[1]) : 0,
        warnings: warnMatch ? parseInt(warnMatch[1]) : 0,
        fixed: fix ? 0 : undefined,
      });
    } catch (e: unknown) {
      const error = e as { stdout?: string; stderr?: string };
      return err("lint:failed", { output: error.stdout || error.stderr });
    }
  },
};

// dev:fmt - Format code
export const devFmt: Cmd<{ check?: boolean }, { formatted: boolean }> = {
  name: "dev:fmt",
  phase: ["dev"],
  schema: z.object({ check: z.boolean().optional() }),
  async exec({ check }, ctx) {
    try {
      const cmd = check ? "pnpm format --check" : "pnpm format";
      await execAsync(cmd, { cwd: ctx.cwd });
      return ok({ formatted: true });
    } catch {
      return check ? err("fmt:needs-formatting") : err("fmt:failed");
    }
  },
};

export const devCmds = [devInit, devStart, devStop, devStatus, devExec, devWatch, devLint, devFmt];
