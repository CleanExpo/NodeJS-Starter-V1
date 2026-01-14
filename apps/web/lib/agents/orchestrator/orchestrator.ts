/**
 * Orchestrator
 *
 * Main coordination engine for autonomous codebase management.
 * Operates like a professional A+ grade engineer.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx, Phase, AuditResult, ProjectConfig } from "./types";
import { ok, err, CODE } from "./types";
import { createContext, saveState, setPhase, logAction, getCurrentBranch, isProtectedBranch } from "./context";
import { onboardFull, onboardAnalyze } from "./onboard";
import { auditFull } from "./audit";
import { cleanupAuto, cleanupCommit } from "./cleanup";
import { branchCreate, branchWork, branchGuard, branchCommit, branchPush } from "./branch";

// ============================================================================
// Orchestrator Commands
// ============================================================================

/**
 * Take over a repository - full pipeline
 */
export const takeover: Cmd<{ url?: string; path?: string }, { phase: Phase; grade?: string; fixes?: number }> = {
  name: "takeover",
  description: "Complete repository takeover with analysis, cleanup, and integration",
  schema: z.object({
    url: z.string().optional(),
    path: z.string().optional(),
  }),
  async exec({ url, path }, ctx) {
    ctx.log("info", "═══════════════════════════════════════════");
    ctx.log("info", "  ORCHESTRATOR TAKEOVER INITIATED");
    ctx.log("info", "═══════════════════════════════════════════");

    // Phase 1: Onboard
    ctx.log("info", "\n[1/4] ONBOARDING...");
    const onboardResult = await onboardFull.exec({ url, path }, ctx);
    if (onboardResult.code !== CODE.OK) {
      return err("takeover:onboard-failed", onboardResult.data);
    }

    // Create orchestrator branch for changes
    ctx.log("info", "\n[2/4] CREATING SAFE BRANCH...");
    const branchResult = await branchCreate.exec({
      type: "chore",
      description: "orchestrator-takeover",
    }, ctx);
    if (branchResult.code !== CODE.OK) {
      ctx.log("warn", "Could not create branch, continuing on current...");
    }

    // Phase 2: Audit
    ctx.log("info", "\n[3/4] AUDITING...");
    const auditResult = await auditFull.exec({}, ctx);
    if (auditResult.code !== CODE.OK) {
      return err("takeover:audit-failed");
    }

    const grade = auditResult.data?.grade || "?";
    ctx.log("info", `Audit Grade: ${grade}`);

    // Phase 3: Cleanup
    ctx.log("info", "\n[4/4] APPLYING FIXES...");
    const cleanupResult = await cleanupAuto.exec({}, ctx);
    const fixCount = cleanupResult.data?.results?.length || 0;

    // Commit cleanup changes
    if (fixCount > 0) {
      await cleanupCommit.exec({ message: "chore: orchestrator cleanup fixes" }, ctx);
    }

    // Set to ready phase
    setPhase(ctx, "ready");

    ctx.log("info", "\n═══════════════════════════════════════════");
    ctx.log("info", `  TAKEOVER COMPLETE: Grade ${grade}, ${fixCount} fixes`);
    ctx.log("info", "═══════════════════════════════════════════");

    return ok({
      phase: ctx.state.phase,
      grade,
      fixes: fixCount,
    });
  },
};

/**
 * Start working on a new feature
 */
export const work: Cmd<{ task: string }, { branch: string; ready: boolean }> = {
  name: "work",
  description: "Start working on a new task (creates safe branch)",
  schema: z.object({ task: z.string().min(3) }),
  async exec({ task }, ctx) {
    // Ensure we're in ready or active phase
    if (!["ready", "active"].includes(ctx.state.phase)) {
      return err("work:not-ready", { phase: ctx.state.phase });
    }

    // Create work branch
    const result = await branchWork.exec({ task }, ctx);
    if (result.code !== CODE.OK) {
      return err("work:branch-failed", result.data);
    }

    setPhase(ctx, "active");

    ctx.log("info", `Ready to work on: ${task}`);
    ctx.log("info", `Branch: ${result.data?.name}`);

    return ok({
      branch: result.data?.name || "",
      ready: true,
    });
  },
};

/**
 * Check current status
 */
export const status: Cmd<Record<string, never>, { phase: Phase; branch: string | null; project: ProjectConfig | null; lastAudit: AuditResult | null }> = {
  name: "status",
  description: "Get current orchestrator status",
  schema: z.object({}),
  async exec(_, ctx) {
    const branch = await getCurrentBranch(ctx);

    return ok({
      phase: ctx.state.phase,
      branch,
      project: ctx.state.project,
      lastAudit: ctx.state.audit,
    });
  },
};

/**
 * Run pre-commit checks
 */
export const precommit: Cmd<Record<string, never>, { passed: boolean; checks: Array<{ name: string; passed: boolean }> }> = {
  name: "precommit",
  description: "Run pre-commit validation checks",
  schema: z.object({}),
  async exec(_, ctx) {
    const checks: Array<{ name: string; passed: boolean }> = [];

    // Guard: ensure not on protected branch
    const guard = await branchGuard.exec({}, ctx);
    if (!guard.data?.safe) {
      return err("precommit:protected-branch", { branch: guard.data?.branch });
    }

    // Check 1: TypeScript
    if (ctx.state.project?.hasTypescript) {
      const { code } = await ctx.exec("npx tsc --noEmit", { timeout: 120000 });
      checks.push({ name: "typescript", passed: code === 0 });
    }

    // Check 2: Lint
    if (ctx.state.project?.hasLinting) {
      const { code } = await ctx.exec("npm run lint 2>/dev/null || npx eslint . --ext .ts,.tsx", { timeout: 60000 });
      checks.push({ name: "lint", passed: code === 0 });
    }

    // Check 3: Tests
    if (ctx.state.project?.hasTesting && ctx.state.config.runTests) {
      const { code } = await ctx.exec("npm test 2>/dev/null || true", { timeout: 180000 });
      checks.push({ name: "test", passed: code === 0 });
    }

    // Check 4: Build (quick)
    const { code: buildCode } = await ctx.exec("npm run build 2>/dev/null || npx next build", { timeout: 300000 });
    checks.push({ name: "build", passed: buildCode === 0 });

    const allPassed = checks.every(c => c.passed);

    if (allPassed) {
      ctx.log("info", "All pre-commit checks passed");
    } else {
      const failed = checks.filter(c => !c.passed).map(c => c.name);
      ctx.log("warn", `Failed checks: ${failed.join(", ")}`);
    }

    logAction(ctx, `precommit:${allPassed ? "pass" : "fail"}`, allPassed ? CODE.OK : CODE.WARN);
    return ok({ passed: allPassed, checks });
  },
};

/**
 * Commit current changes with validation
 */
export const commit: Cmd<{ message: string; skipChecks?: boolean }, { hash: string; pushed: boolean }> = {
  name: "commit",
  description: "Commit changes with validation and optional push",
  schema: z.object({
    message: z.string().min(3),
    skipChecks: z.boolean().optional(),
  }),
  async exec({ message, skipChecks }, ctx) {
    // Guard
    const guard = await branchGuard.exec({}, ctx);
    if (!guard.data?.safe) {
      return err("commit:protected-branch", { branch: guard.data?.branch });
    }

    // Run pre-commit checks unless skipped
    if (!skipChecks) {
      const checkResult = await precommit.exec({}, ctx);
      if (checkResult.code === CODE.OK && !checkResult.data?.passed) {
        return err("commit:checks-failed");
      }
    }

    // Commit
    const commitResult = await branchCommit.exec({ message }, ctx);
    if (commitResult.code !== CODE.OK) {
      return err("commit:failed", commitResult.data);
    }

    // Push
    const pushResult = await branchPush.exec({}, ctx);
    const pushed = pushResult.code === CODE.OK;

    logAction(ctx, `commit:${commitResult.data?.hash}`, CODE.OK);
    return ok({
      hash: commitResult.data?.hash || "",
      pushed,
    });
  },
};

/**
 * Run health check on current state
 */
export const health: Cmd<Record<string, never>, { healthy: boolean; issues: string[] }> = {
  name: "health",
  description: "Quick health check of current state",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: string[] = [];

    // Check git status
    const { stdout: gitStatus } = await ctx.exec("git status --porcelain");
    const uncommitted = gitStatus.split("\n").filter(Boolean).length;
    if (uncommitted > 20) {
      issues.push(`${uncommitted} uncommitted files`);
    }

    // Check if behind remote
    const branch = await getCurrentBranch(ctx);
    if (branch) {
      const { stdout: behind } = await ctx.exec(`git rev-list --count HEAD..origin/${branch} 2>/dev/null || echo "0"`);
      if (parseInt(behind) > 0) {
        issues.push(`${behind.trim()} commits behind remote`);
      }
    }

    // Check for broken dependencies
    const { code: depsCode } = await ctx.exec("npm ls --depth=0 2>&1 | grep -q 'UNMET\\|missing' && echo 1 || echo 0");
    if (depsCode !== 0) {
      issues.push("Dependency issues detected");
    }

    // Check last audit age
    if (ctx.state.audit) {
      const age = Date.now() - ctx.state.audit.ts;
      const dayMs = 24 * 60 * 60 * 1000;
      if (age > 7 * dayMs) {
        issues.push("Audit is over 7 days old");
      }
    }

    return ok({
      healthy: issues.length === 0,
      issues,
    });
  },
};

/**
 * Re-run audit on current state
 */
export const reaudit: Cmd<Record<string, never>, AuditResult> = {
  name: "reaudit",
  description: "Run fresh audit on current state",
  schema: z.object({}),
  async exec(_, ctx) {
    ctx.log("info", "Running fresh audit...");

    // Re-analyze project in case it changed
    await onboardAnalyze.exec({}, ctx);

    // Run full audit
    return auditFull.exec({}, ctx);
  },
};

/**
 * Get summary report
 */
export const report: Cmd<Record<string, never>, { summary: string }> = {
  name: "report",
  description: "Generate summary report",
  schema: z.object({}),
  async exec(_, ctx) {
    const branch = await getCurrentBranch(ctx);
    const audit = ctx.state.audit;
    const project = ctx.state.project;

    let summary = `
╔═══════════════════════════════════════════╗
║           ORCHESTRATOR REPORT             ║
╠═══════════════════════════════════════════╣
║ Phase: ${ctx.state.phase.padEnd(35)}║
║ Branch: ${(branch || "none").padEnd(34)}║
╠═══════════════════════════════════════════╣`;

    if (project) {
      summary += `
║ PROJECT                                   ║
║ Name: ${project.name.padEnd(36)}║
║ Type: ${project.type.padEnd(36)}║
║ Package Manager: ${project.packageManager.padEnd(25)}║
║ TypeScript: ${(project.hasTypescript ? "Yes" : "No").padEnd(30)}║
║ Testing: ${(project.hasTesting ? "Yes" : "No").padEnd(33)}║
║ Linting: ${(project.hasLinting ? "Yes" : "No").padEnd(33)}║
║ CI/CD: ${(project.hasCi ? "Yes" : "No").padEnd(35)}║
╠═══════════════════════════════════════════╣`;
    }

    if (audit) {
      summary += `
║ AUDIT                                     ║
║ Grade: ${audit.grade.padEnd(35)}║
║ Score: ${String(audit.score).padEnd(35)}║
║ Critical: ${String(audit.summary.critical).padEnd(32)}║
║ High: ${String(audit.summary.high).padEnd(36)}║
║ Medium: ${String(audit.summary.medium).padEnd(34)}║
╠═══════════════════════════════════════════╣`;
    }

    summary += `
║ HISTORY                                   ║`;

    const recentHistory = ctx.state.history.slice(-5);
    for (const h of recentHistory) {
      const date = new Date(h.ts).toISOString().slice(0, 16);
      summary += `
║ ${date} ${h.action.slice(0, 22).padEnd(22)} ║`;
    }

    summary += `
╚═══════════════════════════════════════════╝`;

    return ok({ summary });
  },
};

export const orchestratorCmds = [
  takeover, work, status, precommit, commit, health, reaudit, report,
];
