/**
 * Branch Manager
 *
 * Git workflow automation for professional development practices.
 * Ensures protected branches remain safe and follows branching strategies.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx, Branch, BranchType } from "./types";
import { ok, err, CODE } from "./types";
import { saveState, logAction, getCurrentBranch, isProtectedBranch } from "./context";

// ============================================================================
// Branch Naming
// ============================================================================

function generateBranchName(type: BranchType, description: string, prefix: string): string {
  const slug = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const timestamp = Date.now().toString(36).slice(-4);
  return `${prefix}${type}/${slug}-${timestamp}`;
}

// ============================================================================
// Commands
// ============================================================================

/**
 * Create new feature branch
 */
export const branchCreate: Cmd<{ type: BranchType; description: string; base?: string }, Branch> = {
  name: "branch:create",
  description: "Create new development branch",
  schema: z.object({
    type: z.enum(["feature", "fix", "refactor", "chore", "release", "hotfix"]),
    description: z.string().min(3).max(100),
    base: z.string().optional(),
  }),
  async exec({ type, description, base }, ctx) {
    const baseBranch = base || ctx.state.git.mainBranch;

    // Ensure we're on the base branch
    await ctx.exec(`git checkout ${baseBranch}`);
    await ctx.exec(`git pull origin ${baseBranch} 2>/dev/null || true`);

    // Generate branch name
    const name = generateBranchName(type, description, ctx.state.git.branchPrefix);

    // Create and checkout
    const { code, stderr } = await ctx.exec(`git checkout -b ${name}`);
    if (code !== 0) {
      return err("branch:create-failed", { stderr });
    }

    const branch: Branch = {
      name,
      type,
      base: baseBranch,
      created: Date.now(),
      description,
      status: "active",
    };

    ctx.state.branches.push(branch);
    ctx.state.activeBranch = name;
    saveState(ctx);

    ctx.log("info", `Created branch: ${name}`);
    logAction(ctx, `branch:create:${name}`, CODE.OK);

    return ok(branch);
  },
};

/**
 * Switch to branch
 */
export const branchSwitch: Cmd<{ name: string }, { switched: boolean; branch: string }> = {
  name: "branch:switch",
  description: "Switch to existing branch",
  schema: z.object({ name: z.string() }),
  async exec({ name }, ctx) {
    // Check if branch exists
    const { stdout: branches } = await ctx.exec("git branch --list");
    if (!branches.includes(name)) {
      return err("branch:not-found", { name });
    }

    const { code, stderr } = await ctx.exec(`git checkout ${name}`);
    if (code !== 0) {
      return err("branch:switch-failed", { stderr });
    }

    ctx.state.activeBranch = name;
    saveState(ctx);

    logAction(ctx, `branch:switch:${name}`, CODE.OK);
    return ok({ switched: true, branch: name });
  },
};

/**
 * List all branches
 */
export const branchList: Cmd<{ remote?: boolean }, { branches: string[]; current: string | null }> = {
  name: "branch:list",
  description: "List all branches",
  schema: z.object({ remote: z.boolean().optional() }),
  async exec({ remote }, ctx) {
    const cmd = remote ? "git branch -a" : "git branch";
    const { stdout } = await ctx.exec(cmd);

    const branches = stdout
      .split("\n")
      .map(b => b.trim().replace(/^\*\s*/, ""))
      .filter(Boolean);

    const current = await getCurrentBranch(ctx);

    return ok({ branches, current });
  },
};

/**
 * Delete branch
 */
export const branchDelete: Cmd<{ name: string; force?: boolean }, { deleted: boolean }> = {
  name: "branch:delete",
  description: "Delete branch (safe mode by default)",
  schema: z.object({
    name: z.string(),
    force: z.boolean().optional(),
  }),
  async exec({ name, force }, ctx) {
    // Never delete protected branches
    if (ctx.state.git.protectedBranches.includes(name)) {
      return err("branch:protected", { name });
    }

    const flag = force ? "-D" : "-d";
    const { code, stderr } = await ctx.exec(`git branch ${flag} ${name}`);

    if (code !== 0) {
      return err("branch:delete-failed", { stderr });
    }

    // Remove from state
    ctx.state.branches = ctx.state.branches.filter(b => b.name !== name);
    if (ctx.state.activeBranch === name) {
      ctx.state.activeBranch = null;
    }
    saveState(ctx);

    logAction(ctx, `branch:delete:${name}`, CODE.OK);
    return ok({ deleted: true });
  },
};

/**
 * Commit changes
 */
export const branchCommit: Cmd<{ message: string; type?: string }, { hash: string; files: number }> = {
  name: "branch:commit",
  description: "Commit staged changes with conventional commit",
  schema: z.object({
    message: z.string().min(3),
    type: z.string().optional(),
  }),
  async exec({ message, type }, ctx) {
    // Check if on protected branch
    if (await isProtectedBranch(ctx)) {
      const branch = await getCurrentBranch(ctx);
      return err("branch:commit-protected", { branch });
    }

    // Stage all changes
    await ctx.exec("git add -A");

    // Check for changes
    const { stdout: status } = await ctx.exec("git status --porcelain");
    if (!status.trim()) {
      return err("branch:no-changes");
    }

    const fileCount = status.split("\n").filter(Boolean).length;

    // Format commit message
    let commitMsg = message;
    if (ctx.state.config.commitStyle === "conventional" && type) {
      commitMsg = `${type}: ${message}`;
    }

    const { code, stderr } = await ctx.exec(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    if (code !== 0) {
      return err("branch:commit-failed", { stderr });
    }

    const { stdout: hash } = await ctx.exec("git rev-parse --short HEAD");

    logAction(ctx, `branch:commit:${hash.trim()}`, CODE.OK);
    return ok({ hash: hash.trim(), files: fileCount });
  },
};

/**
 * Push branch to remote
 */
export const branchPush: Cmd<{ force?: boolean }, { pushed: boolean; remote: string }> = {
  name: "branch:push",
  description: "Push current branch to remote",
  schema: z.object({ force: z.boolean().optional() }),
  async exec({ force }, ctx) {
    const branch = await getCurrentBranch(ctx);
    if (!branch) {
      return err("branch:no-current");
    }

    // Warn on protected branch push
    if (await isProtectedBranch(ctx) && !force) {
      return err("branch:push-protected", { branch });
    }

    const forceFlag = force ? "--force-with-lease" : "";
    const { code, stderr } = await ctx.exec(`git push -u origin ${branch} ${forceFlag}`);

    if (code !== 0) {
      return err("branch:push-failed", { stderr });
    }

    logAction(ctx, `branch:push:${branch}`, CODE.OK);
    return ok({ pushed: true, remote: `origin/${branch}` });
  },
};

/**
 * Pull changes from remote
 */
export const branchPull: Cmd<{ rebase?: boolean }, { pulled: boolean; behind: number }> = {
  name: "branch:pull",
  description: "Pull changes from remote",
  schema: z.object({ rebase: z.boolean().optional() }),
  async exec({ rebase }, ctx) {
    const branch = await getCurrentBranch(ctx);
    if (!branch) {
      return err("branch:no-current");
    }

    const flag = rebase ? "--rebase" : "";
    const { code, stderr } = await ctx.exec(`git pull origin ${branch} ${flag}`);

    if (code !== 0) {
      return err("branch:pull-failed", { stderr });
    }

    logAction(ctx, `branch:pull:${branch}`, CODE.OK);
    return ok({ pulled: true, behind: 0 });
  },
};

/**
 * Merge branch
 */
export const branchMerge: Cmd<{ source: string; squash?: boolean }, { merged: boolean; conflicts: boolean }> = {
  name: "branch:merge",
  description: "Merge source branch into current",
  schema: z.object({
    source: z.string(),
    squash: z.boolean().optional(),
  }),
  async exec({ source, squash }, ctx) {
    const target = await getCurrentBranch(ctx);
    if (!target) {
      return err("branch:no-current");
    }

    const flag = squash ? "--squash" : "";
    const { code, stderr } = await ctx.exec(`git merge ${source} ${flag}`);

    if (code !== 0) {
      if (stderr.includes("CONFLICT")) {
        return ok({ merged: false, conflicts: true });
      }
      return err("branch:merge-failed", { stderr });
    }

    // Update branch status if in state
    const branchInfo = ctx.state.branches.find(b => b.name === source);
    if (branchInfo) {
      branchInfo.status = "merged";
      saveState(ctx);
    }

    logAction(ctx, `branch:merge:${source}→${target}`, CODE.OK);
    return ok({ merged: true, conflicts: false });
  },
};

/**
 * Create safe working branch for current task
 */
export const branchWork: Cmd<{ task: string }, Branch> = {
  name: "branch:work",
  description: "Create safe working branch for task (never touches main)",
  schema: z.object({ task: z.string().min(3) }),
  async exec({ task }, ctx) {
    // Ensure we start from main
    const main = ctx.state.git.mainBranch;
    await ctx.exec(`git fetch origin ${main} 2>/dev/null || true`);
    await ctx.exec(`git checkout ${main}`);
    await ctx.exec(`git pull origin ${main} 2>/dev/null || true`);

    // Determine branch type from task
    let type: BranchType = "feature";
    const lowerTask = task.toLowerCase();
    if (lowerTask.includes("fix") || lowerTask.includes("bug")) type = "fix";
    else if (lowerTask.includes("refactor")) type = "refactor";
    else if (lowerTask.includes("chore") || lowerTask.includes("update")) type = "chore";
    else if (lowerTask.includes("hotfix")) type = "hotfix";

    // Create the branch
    return branchCreate.exec({ type, description: task }, ctx);
  },
};

/**
 * Sync with remote and ensure clean state
 */
export const branchSync: Cmd<Record<string, never>, { synced: boolean; status: string }> = {
  name: "branch:sync",
  description: "Sync with remote and ensure clean state",
  schema: z.object({}),
  async exec(_, ctx) {
    await ctx.exec("git fetch --all --prune");

    const branch = await getCurrentBranch(ctx);
    if (!branch) {
      return ok({ synced: false, status: "no-branch" });
    }

    // Check for uncommitted changes
    const { stdout: status } = await ctx.exec("git status --porcelain");
    if (status.trim()) {
      return ok({ synced: false, status: "uncommitted-changes" });
    }

    // Check if behind remote
    const { stdout: behind } = await ctx.exec(`git rev-list --count HEAD..origin/${branch} 2>/dev/null || echo "0"`);
    const behindCount = parseInt(behind.trim());

    if (behindCount > 0) {
      await ctx.exec(`git pull origin ${branch} --rebase`);
    }

    logAction(ctx, "branch:sync", CODE.OK);
    return ok({ synced: true, status: behindCount > 0 ? "updated" : "up-to-date" });
  },
};

/**
 * Ensure safe state for modifications
 */
export const branchGuard: Cmd<Record<string, never>, { safe: boolean; branch: string | null; reason?: string }> = {
  name: "branch:guard",
  description: "Check if current branch is safe for modifications",
  schema: z.object({}),
  async exec(_, ctx) {
    const branch = await getCurrentBranch(ctx);
    if (!branch) {
      return ok({ safe: false, branch: null, reason: "no-branch" });
    }

    if (await isProtectedBranch(ctx)) {
      return ok({ safe: false, branch, reason: "protected-branch" });
    }

    return ok({ safe: true, branch });
  },
};

export const branchCmds = [
  branchCreate, branchSwitch, branchList, branchDelete,
  branchCommit, branchPush, branchPull, branchMerge,
  branchWork, branchSync, branchGuard,
];
