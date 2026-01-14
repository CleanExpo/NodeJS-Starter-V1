/**
 * Onboard Module
 *
 * Initial repository takeover and project analysis.
 * Detects project type, structure, and configuration.
 */

import { z } from "zod";
import { join } from "path";
import type { Cmd, OrchestratorCtx, ProjectConfig, ProjectType, PackageManager, RepoInput } from "./types";
import { ok, err, CODE } from "./types";
import { saveState, setPhase, logAction } from "./context";

// ============================================================================
// Project Detection
// ============================================================================

/**
 * Detect project type from files
 */
async function detectProjectType(ctx: OrchestratorCtx): Promise<ProjectType> {
  // Check for Next.js
  if (await ctx.exists("next.config.js") || await ctx.exists("next.config.mjs") || await ctx.exists("next.config.ts")) {
    return "nextjs";
  }

  // Check for monorepo
  if (await ctx.exists("pnpm-workspace.yaml") || await ctx.exists("lerna.json") || await ctx.exists("turbo.json")) {
    return "monorepo";
  }

  // Check package.json for React
  const pkg = await ctx.read("package.json");
  if (pkg) {
    const parsed = JSON.parse(pkg);
    if (parsed.dependencies?.react || parsed.devDependencies?.react) {
      return "react";
    }
  }

  // Check for Python
  if (await ctx.exists("pyproject.toml") || await ctx.exists("requirements.txt") || await ctx.exists("setup.py")) {
    return "python";
  }

  // Default to Node if package.json exists
  if (await ctx.exists("package.json")) {
    return "node";
  }

  return "unknown";
}

/**
 * Detect package manager
 */
async function detectPackageManager(ctx: OrchestratorCtx): Promise<PackageManager> {
  if (await ctx.exists("pnpm-lock.yaml")) return "pnpm";
  if (await ctx.exists("yarn.lock")) return "yarn";
  if (await ctx.exists("bun.lockb")) return "bun";
  return "npm";
}

/**
 * Detect frameworks in use
 */
async function detectFrameworks(ctx: OrchestratorCtx): Promise<string[]> {
  const frameworks: string[] = [];
  const pkg = await ctx.read("package.json");

  if (!pkg) return frameworks;

  const parsed = JSON.parse(pkg);
  const allDeps = { ...parsed.dependencies, ...parsed.devDependencies };

  const frameworkMap: Record<string, string> = {
    next: "Next.js",
    react: "React",
    vue: "Vue",
    svelte: "Svelte",
    express: "Express",
    fastify: "Fastify",
    nestjs: "NestJS",
    "@nestjs/core": "NestJS",
    tailwindcss: "Tailwind",
    prisma: "Prisma",
    drizzle: "Drizzle",
    "@trpc/server": "tRPC",
    zod: "Zod",
    typescript: "TypeScript",
    vitest: "Vitest",
    jest: "Jest",
    playwright: "Playwright",
    cypress: "Cypress",
  };

  for (const [dep, name] of Object.entries(frameworkMap)) {
    if (allDeps[dep]) frameworks.push(name);
  }

  return frameworks;
}

/**
 * Find entry points
 */
async function findEntryPoints(ctx: OrchestratorCtx, type: ProjectType): Promise<string[]> {
  const entries: string[] = [];

  if (type === "nextjs" || type === "react") {
    if (await ctx.exists("app/page.tsx")) entries.push("app/page.tsx");
    if (await ctx.exists("src/app/page.tsx")) entries.push("src/app/page.tsx");
    if (await ctx.exists("pages/index.tsx")) entries.push("pages/index.tsx");
    if (await ctx.exists("src/pages/index.tsx")) entries.push("src/pages/index.tsx");
    if (await ctx.exists("src/index.tsx")) entries.push("src/index.tsx");
  }

  if (type === "node") {
    if (await ctx.exists("src/index.ts")) entries.push("src/index.ts");
    if (await ctx.exists("src/main.ts")) entries.push("src/main.ts");
    if (await ctx.exists("index.ts")) entries.push("index.ts");
    if (await ctx.exists("index.js")) entries.push("index.js");
  }

  if (type === "python") {
    if (await ctx.exists("main.py")) entries.push("main.py");
    if (await ctx.exists("src/main.py")) entries.push("src/main.py");
    if (await ctx.exists("app/main.py")) entries.push("app/main.py");
  }

  return entries;
}

// ============================================================================
// Commands
// ============================================================================

/**
 * Clone repository from URL
 */
export const onboardClone: Cmd<{ url: string; branch?: string }, { path: string }> = {
  name: "onboard:clone",
  description: "Clone repository from URL",
  schema: z.object({
    url: z.string().url(),
    branch: z.string().optional(),
  }),
  async exec({ url, branch }, ctx) {
    // Extract repo name from URL
    const match = url.match(/\/([^\/]+?)(\.git)?$/);
    if (!match) return err("onboard:invalid-url");

    const repoName = match[1];
    const targetPath = join(ctx.cwd, repoName);

    // Clone
    const branchArg = branch ? `-b ${branch}` : "";
    const { code, stderr } = await ctx.exec(`git clone ${branchArg} ${url} ${repoName}`);

    if (code !== 0) return err("onboard:clone-failed", { stderr });

    logAction(ctx, `onboard:clone:${repoName}`, CODE.OK);
    return ok({ path: targetPath });
  },
};

/**
 * Analyze project structure
 */
export const onboardAnalyze: Cmd<Record<string, never>, ProjectConfig> = {
  name: "onboard:analyze",
  description: "Analyze project structure and configuration",
  schema: z.object({}),
  async exec(_, ctx) {
    ctx.log("info", "Analyzing project structure...");

    const type = await detectProjectType(ctx);
    const packageManager = await detectPackageManager(ctx);
    const frameworks = await detectFrameworks(ctx);
    const entryPoints = await findEntryPoints(ctx, type);

    // Get project name
    let name = "unknown";
    const pkg = await ctx.read("package.json");
    if (pkg) {
      const parsed = JSON.parse(pkg);
      name = parsed.name || "unknown";
    }

    const config: ProjectConfig = {
      name,
      type,
      packageManager,
      root: ctx.cwd,
      hasTypescript: await ctx.exists("tsconfig.json"),
      hasTesting: await ctx.exists("vitest.config.ts") || await ctx.exists("jest.config.js") || await ctx.exists("jest.config.ts"),
      hasLinting: await ctx.exists(".eslintrc.js") || await ctx.exists(".eslintrc.json") || await ctx.exists("eslint.config.js") || await ctx.exists("eslint.config.mjs"),
      hasDocker: await ctx.exists("Dockerfile") || await ctx.exists("docker-compose.yml"),
      hasCi: await ctx.exists(".github/workflows") || await ctx.exists(".gitlab-ci.yml"),
      frameworks,
      entryPoints,
    };

    ctx.state.project = config;
    saveState(ctx);

    ctx.log("info", `Detected: ${type} project using ${packageManager}`);
    ctx.log("info", `Frameworks: ${frameworks.join(", ") || "none detected"}`);

    logAction(ctx, "onboard:analyze", CODE.OK);
    return ok(config);
  },
};

/**
 * Initialize git configuration
 */
export const onboardGit: Cmd<Record<string, never>, { branch: string; remote: string }> = {
  name: "onboard:git",
  description: "Initialize git configuration and detect branches",
  schema: z.object({}),
  async exec(_, ctx) {
    // Check if git repo
    const { code } = await ctx.exec("git status");
    if (code !== 0) {
      // Initialize git
      await ctx.exec("git init");
      ctx.log("info", "Initialized git repository");
    }

    // Get current branch
    const { stdout: branch } = await ctx.exec("git rev-parse --abbrev-ref HEAD");
    const currentBranch = branch.trim() || "main";

    // Detect main branch
    const { stdout: branches } = await ctx.exec("git branch -a");
    let mainBranch = "main";
    if (branches.includes("main")) mainBranch = "main";
    else if (branches.includes("master")) mainBranch = "master";

    // Get remote
    const { stdout: remote } = await ctx.exec("git remote get-url origin 2>/dev/null || echo ''");
    const remoteUrl = remote.trim();

    ctx.state.git.mainBranch = mainBranch;
    ctx.state.git.protectedBranches = [mainBranch, "master", "main", "develop", "staging", "production"];

    saveState(ctx);

    ctx.log("info", `Git configured: branch=${currentBranch}, main=${mainBranch}`);
    logAction(ctx, "onboard:git", CODE.OK);

    return ok({ branch: currentBranch, remote: remoteUrl });
  },
};

/**
 * Install dependencies
 */
export const onboardDeps: Cmd<{ force?: boolean }, { installed: boolean; manager: PackageManager }> = {
  name: "onboard:deps",
  description: "Install project dependencies",
  schema: z.object({ force: z.boolean().optional() }),
  async exec({ force }, ctx) {
    const pm = ctx.state.project?.packageManager || "npm";
    const hasLock = await ctx.exists(`${pm === "pnpm" ? "pnpm-lock.yaml" : pm === "yarn" ? "yarn.lock" : "package-lock.json"}`);

    if (!force && await ctx.exists("node_modules") && hasLock) {
      ctx.log("info", "Dependencies already installed");
      return ok({ installed: true, manager: pm });
    }

    ctx.log("info", `Installing dependencies with ${pm}...`);

    const installCmd = {
      npm: "npm install",
      yarn: "yarn install",
      pnpm: "pnpm install",
      bun: "bun install",
    }[pm];

    const { code, stderr } = await ctx.exec(installCmd, { timeout: 300000 });

    if (code !== 0) return err("onboard:deps-failed", { stderr });

    logAction(ctx, "onboard:deps", CODE.OK);
    return ok({ installed: true, manager: pm });
  },
};

/**
 * Create backup branch before modifications
 */
export const onboardBackup: Cmd<Record<string, never>, { branch: string }> = {
  name: "onboard:backup",
  description: "Create backup branch before modifications",
  schema: z.object({}),
  async exec(_, ctx) {
    if (!ctx.state.config.createBackup) {
      return ok({ branch: "" });
    }

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const backupBranch = `backup/${timestamp}-pre-orchestrator`;

    const { code } = await ctx.exec(`git checkout -b ${backupBranch}`);
    if (code !== 0) {
      // Branch might exist, try switching back
      await ctx.exec(`git checkout -`);
      return err("onboard:backup-exists");
    }

    // Switch back to original branch
    await ctx.exec(`git checkout -`);

    ctx.log("info", `Backup created: ${backupBranch}`);
    logAction(ctx, `onboard:backup:${backupBranch}`, CODE.OK);

    return ok({ branch: backupBranch });
  },
};

/**
 * Full onboarding process
 */
export const onboardFull: Cmd<{ url?: string; path?: string; skipDeps?: boolean }, { project: ProjectConfig; ready: boolean }> = {
  name: "onboard:full",
  description: "Complete onboarding process for repository",
  schema: z.object({
    url: z.string().optional(),
    path: z.string().optional(),
    skipDeps: z.boolean().optional(),
  }),
  async exec({ url, path, skipDeps }, ctx) {
    ctx.log("info", "Starting full onboarding process...");
    setPhase(ctx, "init");

    // Clone if URL provided
    if (url) {
      const cloneResult = await onboardClone.exec({ url }, ctx);
      if (cloneResult.code !== CODE.OK) return cloneResult as typeof cloneResult & { data: never };
    }

    // Analyze project
    const analyzeResult = await onboardAnalyze.exec({}, ctx);
    if (analyzeResult.code !== CODE.OK) return err("onboard:analyze-failed");

    // Configure git
    await onboardGit.exec({}, ctx);

    // Create backup
    await onboardBackup.exec({}, ctx);

    // Install dependencies
    if (!skipDeps) {
      const depsResult = await onboardDeps.exec({}, ctx);
      if (depsResult.code !== CODE.OK) {
        ctx.log("warn", "Dependency installation failed, continuing...");
      }
    }

    setPhase(ctx, "audit");
    ctx.log("info", "Onboarding complete, ready for audit");

    return ok({
      project: ctx.state.project!,
      ready: true,
    });
  },
};

export const onboardCmds = [onboardClone, onboardAnalyze, onboardGit, onboardDeps, onboardBackup, onboardFull];
