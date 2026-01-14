/**
 * Self-Healing System
 *
 * Automatically detects and recovers from common issues.
 * Operates like a senior engineer who anticipates problems.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx } from "./types";
import { ok, err, CODE } from "./types";
import { logAction } from "./context";
import { isDemo } from "./modes";

// ============================================================================
// Issue Detection
// ============================================================================

interface DetectedIssue {
  id: string;
  type: "deps" | "git" | "build" | "config" | "runtime";
  severity: "critical" | "warning" | "info";
  description: string;
  autoHealable: boolean;
  healAction?: string;
}

/**
 * Detect common issues
 */
export const healDetect: Cmd<Record<string, never>, { issues: DetectedIssue[] }> = {
  name: "heal:detect",
  description: "Detect issues that can be auto-healed",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: DetectedIssue[] = [];

    // Check node_modules
    if (!await ctx.exists("node_modules")) {
      issues.push({
        id: "missing-node-modules",
        type: "deps",
        severity: "critical",
        description: "node_modules directory missing",
        autoHealable: true,
        healAction: "npm install",
      });
    }

    // Check package-lock sync
    const { code: lockCheck } = await ctx.exec("npm ls --depth=0 2>&1 | grep -q 'missing\\|invalid'");
    if (lockCheck === 0) {
      issues.push({
        id: "deps-out-of-sync",
        type: "deps",
        severity: "warning",
        description: "Dependencies out of sync with lock file",
        autoHealable: true,
        healAction: "npm ci",
      });
    }

    // Check for uncommitted changes in critical files
    const { stdout: status } = await ctx.exec("git status --porcelain");
    if (status.includes("package-lock.json") || status.includes("pnpm-lock.yaml")) {
      issues.push({
        id: "uncommitted-lockfile",
        type: "git",
        severity: "warning",
        description: "Lock file has uncommitted changes",
        autoHealable: false,
      });
    }

    // Check for merge conflicts
    const { stdout: conflicts } = await ctx.exec("git diff --name-only --diff-filter=U");
    if (conflicts.trim()) {
      issues.push({
        id: "merge-conflicts",
        type: "git",
        severity: "critical",
        description: `Merge conflicts in: ${conflicts.trim().split("\n").join(", ")}`,
        autoHealable: false,
      });
    }

    // Check .next cache corruption (Next.js)
    if (await ctx.exists(".next")) {
      const { code: nextCheck } = await ctx.exec("test -f .next/BUILD_ID");
      if (nextCheck !== 0) {
        issues.push({
          id: "next-cache-corrupt",
          type: "build",
          severity: "warning",
          description: "Next.js build cache may be corrupted",
          autoHealable: true,
          healAction: "rm -rf .next",
        });
      }
    }

    // Check TypeScript config
    if (await ctx.exists("tsconfig.json")) {
      const { code: tsCheck } = await ctx.exec("npx tsc --noEmit --listFiles 2>&1 | head -1");
      if (tsCheck !== 0) {
        issues.push({
          id: "ts-config-error",
          type: "config",
          severity: "warning",
          description: "TypeScript configuration has errors",
          autoHealable: false,
        });
      }
    }

    // Check disk space
    const { stdout: disk } = await ctx.exec("df -h . | tail -1 | awk '{print $5}' | sed 's/%//'");
    const usedPercent = parseInt(disk.trim());
    if (usedPercent > 90) {
      issues.push({
        id: "low-disk-space",
        type: "runtime",
        severity: "critical",
        description: `Disk usage at ${usedPercent}%`,
        autoHealable: true,
        healAction: "npm cache clean --force && rm -rf .next/cache",
      });
    }

    // Check for stale branches
    const { stdout: branches } = await ctx.exec("git branch --merged main 2>/dev/null | grep -v main | wc -l");
    const staleBranches = parseInt(branches.trim());
    if (staleBranches > 10) {
      issues.push({
        id: "stale-branches",
        type: "git",
        severity: "info",
        description: `${staleBranches} merged branches could be cleaned`,
        autoHealable: true,
        healAction: "git branch --merged main | grep -v main | xargs git branch -d",
      });
    }

    return ok({ issues });
  },
};

/**
 * Auto-heal detected issues
 */
export const healAuto: Cmd<{ dryRun?: boolean }, { healed: string[]; failed: string[]; skipped: string[] }> = {
  name: "heal:auto",
  description: "Automatically fix healable issues",
  schema: z.object({ dryRun: z.boolean().optional() }),
  async exec({ dryRun }, ctx) {
    const healed: string[] = [];
    const failed: string[] = [];
    const skipped: string[] = [];

    // Detect issues
    const detectResult = await healDetect.exec({}, ctx);
    if (detectResult.code !== CODE.OK || !detectResult.data) {
      return err("heal:detect-failed");
    }

    const issues = detectResult.data.issues;
    ctx.log("info", `Found ${issues.length} issues, ${issues.filter(i => i.autoHealable).length} auto-healable`);

    for (const issue of issues) {
      if (!issue.autoHealable || !issue.healAction) {
        skipped.push(issue.id);
        continue;
      }

      if (dryRun) {
        ctx.log("info", `[DRY RUN] Would heal ${issue.id}: ${issue.healAction}`);
        healed.push(issue.id);
        continue;
      }

      ctx.log("info", `Healing ${issue.id}...`);
      const { code } = await ctx.exec(issue.healAction, { timeout: 300000 });

      if (code === 0) {
        healed.push(issue.id);
        ctx.log("info", `✓ Healed: ${issue.id}`);
      } else {
        failed.push(issue.id);
        ctx.log("warn", `✗ Failed: ${issue.id}`);
      }
    }

    logAction(ctx, `heal:auto:${healed.length}/${issues.length}`, CODE.OK);
    return ok({ healed, failed, skipped });
  },
};

/**
 * Heal specific issue by ID
 */
export const healOne: Cmd<{ id: string }, { healed: boolean }> = {
  name: "heal:one",
  description: "Heal specific issue by ID",
  schema: z.object({ id: z.string() }),
  async exec({ id }, ctx) {
    const detectResult = await healDetect.exec({}, ctx);
    if (detectResult.code !== CODE.OK || !detectResult.data) {
      return err("heal:detect-failed");
    }

    const issue = detectResult.data.issues.find(i => i.id === id);
    if (!issue) {
      return err(`heal:issue-not-found:${id}`);
    }

    if (!issue.autoHealable || !issue.healAction) {
      return err(`heal:not-healable:${id}`);
    }

    const { code } = await ctx.exec(issue.healAction, { timeout: 300000 });

    logAction(ctx, `heal:one:${id}`, code === 0 ? CODE.OK : CODE.ERR);
    return ok({ healed: code === 0 });
  },
};

/**
 * Deep clean - aggressive cleanup
 */
export const healDeepClean: Cmd<Record<string, never>, { cleaned: string[] }> = {
  name: "heal:deep-clean",
  description: "Aggressive cleanup of caches and temp files",
  schema: z.object({}),
  async exec(_, ctx) {
    const cleaned: string[] = [];

    const targets = [
      { path: "node_modules/.cache", name: "node_modules cache" },
      { path: ".next/cache", name: "Next.js cache" },
      { path: ".turbo", name: "Turbo cache" },
      { path: "coverage", name: "Coverage reports" },
      { path: ".nyc_output", name: "NYC output" },
      { path: "*.tsbuildinfo", name: "TS build info" },
    ];

    for (const target of targets) {
      if (await ctx.exists(target.path)) {
        await ctx.exec(`rm -rf "${target.path}"`);
        cleaned.push(target.name);
      }
    }

    // Clean npm cache
    await ctx.exec("npm cache clean --force 2>/dev/null || true");
    cleaned.push("npm cache");

    // Clean git garbage
    await ctx.exec("git gc --auto 2>/dev/null || true");
    cleaned.push("git gc");

    ctx.log("info", `Deep clean complete: ${cleaned.length} items cleaned`);
    logAction(ctx, "heal:deep-clean", CODE.OK);

    return ok({ cleaned });
  },
};

/**
 * Recovery mode - attempt full recovery
 */
export const healRecover: Cmd<Record<string, never>, { steps: Array<{ name: string; success: boolean }> }> = {
  name: "heal:recover",
  description: "Full recovery attempt for broken state",
  schema: z.object({}),
  async exec(_, ctx) {
    const steps: Array<{ name: string; success: boolean }> = [];

    ctx.log("info", "Starting full recovery...");

    // Step 1: Clean caches
    ctx.log("info", "[1/6] Cleaning caches...");
    const cleanResult = await healDeepClean.exec({}, ctx);
    steps.push({ name: "clean-caches", success: cleanResult.code === CODE.OK });

    // Step 2: Reset node_modules
    ctx.log("info", "[2/6] Reinstalling dependencies...");
    await ctx.exec("rm -rf node_modules");
    const { code: installCode } = await ctx.exec("npm install", { timeout: 300000 });
    steps.push({ name: "reinstall-deps", success: installCode === 0 });

    // Step 3: Verify git state
    ctx.log("info", "[3/6] Verifying git state...");
    const { code: gitCode } = await ctx.exec("git status");
    steps.push({ name: "verify-git", success: gitCode === 0 });

    // Step 4: Type check
    ctx.log("info", "[4/6] Running type check...");
    const { code: tsCode } = await ctx.exec("npx tsc --noEmit 2>/dev/null || true", { timeout: 120000 });
    steps.push({ name: "type-check", success: tsCode === 0 });

    // Step 5: Lint
    ctx.log("info", "[5/6] Running lint...");
    const { code: lintCode } = await ctx.exec("npm run lint 2>/dev/null || true", { timeout: 60000 });
    steps.push({ name: "lint", success: lintCode === 0 });

    // Step 6: Build
    ctx.log("info", "[6/6] Testing build...");
    const { code: buildCode } = await ctx.exec("npm run build 2>/dev/null || true", { timeout: 300000 });
    steps.push({ name: "build", success: buildCode === 0 });

    const successCount = steps.filter(s => s.success).length;
    ctx.log("info", `Recovery complete: ${successCount}/${steps.length} steps succeeded`);

    logAction(ctx, `heal:recover:${successCount}/${steps.length}`, CODE.OK);
    return ok({ steps });
  },
};

export const healingCmds = [healDetect, healAuto, healOne, healDeepClean, healRecover];
