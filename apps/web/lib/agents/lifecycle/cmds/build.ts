/**
 * build - Build phase commands
 */

import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { join } from "path";
import type { Cmd } from "../types";
import { ok, err } from "../types";

const execAsync = promisify(exec);

interface BuildResult {
  success: boolean;
  duration: number;
  artifacts: string[];
  size: number;
}

// build:run - Run build
export const buildRun: Cmd<{ clean?: boolean }, BuildResult> = {
  name: "build:run",
  phase: ["build"],
  schema: z.object({ clean: z.boolean().optional() }),
  async exec({ clean }, ctx) {
    const start = Date.now();

    if (clean) {
      await execAsync("rm -rf .next out dist build", { cwd: ctx.cwd }).catch(() => {});
    }

    try {
      await execAsync("pnpm build", { cwd: ctx.cwd, timeout: 300000 });
      const duration = Date.now() - start;

      // Find artifacts
      const artifacts: string[] = [];
      let size = 0;

      for (const dir of [".next", "out", "dist", "build"]) {
        const path = join(ctx.cwd, dir);
        if (existsSync(path)) {
          artifacts.push(dir);
          size += getDirSize(path);
        }
      }

      await ctx.mem.set("build:last", { ts: Date.now(), duration, artifacts, size }, { type: "state" });

      return ok({ success: true, duration, artifacts, size });
    } catch (e: unknown) {
      return err(`build:failed`, { duration: Date.now() - start, error: String(e) });
    }
  },
};

// build:check - Check build status
export const buildCheck: Cmd<Record<string, never>, { exists: boolean; age?: number; size?: number }> = {
  name: "build:check",
  phase: ["build"],
  schema: z.object({}),
  async exec(_, ctx) {
    for (const dir of [".next", "out", "dist", "build"]) {
      const path = join(ctx.cwd, dir);
      if (existsSync(path)) {
        const stat = statSync(path);
        return ok({
          exists: true,
          age: Date.now() - stat.mtimeMs,
          size: getDirSize(path),
        });
      }
    }
    return ok({ exists: false });
  },
};

// build:analyze - Analyze build output
export const buildAnalyze: Cmd<Record<string, never>, { chunks: Array<{ name: string; size: number }> }> = {
  name: "build:analyze",
  phase: ["build"],
  schema: z.object({}),
  async exec(_, ctx) {
    const nextPath = join(ctx.cwd, ".next", "static", "chunks");
    if (!existsSync(nextPath)) {
      return err("build:no-output");
    }

    const chunks = readdirSync(nextPath)
      .filter((f) => f.endsWith(".js"))
      .map((f) => ({
        name: f,
        size: statSync(join(nextPath, f)).size,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 20);

    return ok({ chunks });
  },
};

// build:clean - Clean build artifacts
export const buildClean: Cmd<Record<string, never>, { cleaned: string[] }> = {
  name: "build:clean",
  phase: ["build"],
  schema: z.object({}),
  async exec(_, ctx) {
    const cleaned: string[] = [];

    for (const dir of [".next", "out", "dist", "build", "node_modules/.cache"]) {
      const path = join(ctx.cwd, dir);
      if (existsSync(path)) {
        await execAsync(`rm -rf "${path}"`, { cwd: ctx.cwd });
        cleaned.push(dir);
      }
    }

    await ctx.mem.del("build:last");
    return ok({ cleaned });
  },
};

// build:typecheck - Run type checking
export const buildTypecheck: Cmd<Record<string, never>, { errors: number; files: number }> = {
  name: "build:typecheck",
  phase: ["build"],
  schema: z.object({}),
  async exec(_, ctx) {
    try {
      const { stdout, stderr } = await execAsync("pnpm type-check 2>&1 || true", { cwd: ctx.cwd });
      const output = stdout + stderr;
      const errorMatch = output.match(/Found (\d+) error/);
      const errors = errorMatch ? parseInt(errorMatch[1]) : 0;

      return ok({ errors, files: (output.match(/Checking/g) || []).length });
    } catch (e: unknown) {
      return err("typecheck:failed", { error: String(e) });
    }
  },
};

// build:bundle - Create production bundle
export const buildBundle: Cmd<{ minify?: boolean }, { path: string; size: number }> = {
  name: "build:bundle",
  phase: ["build"],
  schema: z.object({ minify: z.boolean().optional() }),
  async exec({ minify = true }, ctx) {
    try {
      const cmd = minify ? "pnpm build" : "NODE_ENV=production pnpm build";
      await execAsync(cmd, { cwd: ctx.cwd, timeout: 300000 });

      const outDir = existsSync(join(ctx.cwd, ".next")) ? ".next" : "dist";
      const size = getDirSize(join(ctx.cwd, outDir));

      return ok({ path: outDir, size });
    } catch (e) {
      return err("bundle:failed", { error: String(e) });
    }
  },
};

// build:test - Run tests
export const buildTest: Cmd<{ coverage?: boolean }, { passed: number; failed: number; coverage?: number }> = {
  name: "build:test",
  phase: ["build", "dev"],
  schema: z.object({ coverage: z.boolean().optional() }),
  async exec({ coverage }, ctx) {
    try {
      const cmd = coverage ? "pnpm test:coverage" : "pnpm test";
      const { stdout, stderr } = await execAsync(cmd, { cwd: ctx.cwd, timeout: 120000 });
      const output = stdout + stderr;

      const passedMatch = output.match(/(\d+)\s*pass/i);
      const failedMatch = output.match(/(\d+)\s*fail/i);
      const covMatch = output.match(/All files\s*\|\s*[\d.]+\s*\|\s*[\d.]+\s*\|\s*[\d.]+\s*\|\s*([\d.]+)/);

      return ok({
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        coverage: covMatch ? parseFloat(covMatch[1]) : undefined,
      });
    } catch (e: unknown) {
      const error = e as { stdout?: string };
      return err("test:failed", { output: error.stdout });
    }
  },
};

function getDirSize(dir: string): number {
  if (!existsSync(dir)) return 0;
  let size = 0;
  const files = readdirSync(dir);
  for (const file of files) {
    const path = join(dir, file);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      size += getDirSize(path);
    } else {
      size += stat.size;
    }
  }
  return size;
}

export const buildCmds = [buildRun, buildCheck, buildAnalyze, buildClean, buildTypecheck, buildBundle, buildTest];
