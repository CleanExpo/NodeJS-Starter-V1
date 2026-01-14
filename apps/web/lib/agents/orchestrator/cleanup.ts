/**
 * Cleanup Module
 *
 * Automatic fixing of identified issues.
 * Creates safe fixes and maintains code quality.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx, Issue } from "./types";
import { ok, err, CODE } from "./types";
import { saveState, setPhase, logAction, ensureSafeBranch } from "./context";

// ============================================================================
// Fix Helpers
// ============================================================================

interface FixResult {
  issueId: string;
  fixed: boolean;
  action: string;
}

// ============================================================================
// Security Fixes
// ============================================================================

export const fixGitignore: Cmd<Record<string, never>, { added: string[] }> = {
  name: "fix:gitignore",
  description: "Add missing patterns to .gitignore",
  schema: z.object({}),
  async exec(_, ctx) {
    const patterns = [
      "# Environment",
      ".env",
      ".env.*",
      "!.env.example",
      "",
      "# Secrets",
      "*.pem",
      "*.key",
      "credentials.json",
      "service-account.json",
      "",
      "# IDE",
      ".idea/",
      ".vscode/",
      "*.swp",
      "*.swo",
      "",
      "# OS",
      ".DS_Store",
      "Thumbs.db",
      "",
      "# Dependencies",
      "node_modules/",
      ".pnpm-store/",
      "",
      "# Build",
      "dist/",
      "build/",
      ".next/",
      "out/",
      "",
      "# Cache",
      ".cache/",
      ".turbo/",
      "*.tsbuildinfo",
      "",
      "# Logs",
      "*.log",
      "logs/",
    ];

    let gitignore = await ctx.read(".gitignore") || "";
    const added: string[] = [];

    for (const pattern of patterns) {
      if (pattern && !gitignore.includes(pattern)) {
        added.push(pattern);
      }
    }

    if (added.length > 0) {
      gitignore += "\n\n# Added by Orchestrator\n" + added.join("\n");
      await ctx.write(".gitignore", gitignore);
    }

    logAction(ctx, "fix:gitignore", CODE.OK);
    return ok({ added: added.filter(p => p && !p.startsWith("#")) });
  },
};

export const fixEnvFiles: Cmd<Record<string, never>, { removed: string[] }> = {
  name: "fix:env-files",
  description: "Remove tracked .env files from git",
  schema: z.object({}),
  async exec(_, ctx) {
    const { stdout } = await ctx.exec("git ls-files | grep '\\.env'");
    const envFiles = stdout.split("\n").filter(Boolean);
    const removed: string[] = [];

    for (const file of envFiles) {
      if (file.match(/\.env($|\.local|\.prod|\.dev|\.staging)/)) {
        await ctx.exec(`git rm --cached "${file}"`);
        removed.push(file);
      }
    }

    if (removed.length > 0) {
      ctx.log("info", `Removed ${removed.length} env files from tracking`);
    }

    logAction(ctx, "fix:env-files", CODE.OK);
    return ok({ removed });
  },
};

export const fixNpmAudit: Cmd<{ force?: boolean }, { fixed: number }> = {
  name: "fix:npm-audit",
  description: "Fix npm vulnerabilities",
  schema: z.object({ force: z.boolean().optional() }),
  async exec({ force }, ctx) {
    const cmd = force ? "npm audit fix --force" : "npm audit fix";
    const { code, stdout } = await ctx.exec(cmd, { timeout: 120000 });

    const fixedMatch = stdout.match(/fixed (\d+)/);
    const fixed = fixedMatch ? parseInt(fixedMatch[1]) : 0;

    logAction(ctx, "fix:npm-audit", code === 0 ? CODE.OK : CODE.WARN);
    return ok({ fixed });
  },
};

// ============================================================================
// Quality Fixes
// ============================================================================

export const fixTsconfig: Cmd<Record<string, never>, { updated: string[] }> = {
  name: "fix:tsconfig",
  description: "Enable strict TypeScript options",
  schema: z.object({}),
  async exec(_, ctx) {
    const content = await ctx.read("tsconfig.json");
    if (!content) return ok({ updated: [] });

    const config = JSON.parse(content);
    const updated: string[] = [];

    if (!config.compilerOptions) config.compilerOptions = {};

    const strictOptions: Record<string, unknown> = {
      strict: true,
      noUncheckedIndexedAccess: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
    };

    for (const [key, value] of Object.entries(strictOptions)) {
      if (config.compilerOptions[key] !== value) {
        config.compilerOptions[key] = value;
        updated.push(key);
      }
    }

    if (updated.length > 0) {
      await ctx.write("tsconfig.json", JSON.stringify(config, null, 2));
      ctx.log("info", `Updated tsconfig.json: ${updated.join(", ")}`);
    }

    logAction(ctx, "fix:tsconfig", CODE.OK);
    return ok({ updated });
  },
};

export const fixPrettier: Cmd<Record<string, never>, { created: boolean }> = {
  name: "fix:prettier",
  description: "Create Prettier configuration",
  schema: z.object({}),
  async exec(_, ctx) {
    if (await ctx.exists(".prettierrc") || await ctx.exists(".prettierrc.json") || await ctx.exists("prettier.config.js")) {
      return ok({ created: false });
    }

    const config = {
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "es5",
      printWidth: 100,
      bracketSpacing: true,
      arrowParens: "always",
    };

    await ctx.write(".prettierrc", JSON.stringify(config, null, 2));

    // Also create .prettierignore
    const ignore = [
      "node_modules/",
      "dist/",
      "build/",
      ".next/",
      "coverage/",
      "*.min.js",
      "pnpm-lock.yaml",
    ].join("\n");
    await ctx.write(".prettierignore", ignore);

    logAction(ctx, "fix:prettier", CODE.OK);
    return ok({ created: true });
  },
};

// ============================================================================
// Configuration Fixes
// ============================================================================

export const fixNodeVersion: Cmd<{ version?: string }, { created: boolean }> = {
  name: "fix:node-version",
  description: "Create .nvmrc file",
  schema: z.object({ version: z.string().optional() }),
  async exec({ version = "20" }, ctx) {
    if (await ctx.exists(".nvmrc") || await ctx.exists(".node-version")) {
      return ok({ created: false });
    }

    await ctx.write(".nvmrc", version);
    logAction(ctx, "fix:node-version", CODE.OK);
    return ok({ created: true });
  },
};

export const fixEditorconfig: Cmd<Record<string, never>, { created: boolean }> = {
  name: "fix:editorconfig",
  description: "Create .editorconfig file",
  schema: z.object({}),
  async exec(_, ctx) {
    if (await ctx.exists(".editorconfig")) {
      return ok({ created: false });
    }

    const config = `# EditorConfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
`;

    await ctx.write(".editorconfig", config);
    logAction(ctx, "fix:editorconfig", CODE.OK);
    return ok({ created: true });
  },
};

export const fixPackageJson: Cmd<Record<string, never>, { updated: string[] }> = {
  name: "fix:package-json",
  description: "Fix package.json issues",
  schema: z.object({}),
  async exec(_, ctx) {
    const content = await ctx.read("package.json");
    if (!content) return ok({ updated: [] });

    const pkg = JSON.parse(content);
    const updated: string[] = [];

    // Add engines if missing
    if (!pkg.engines) {
      pkg.engines = { node: ">=18" };
      updated.push("engines");
    }

    // Move dev dependencies
    const devPkgs = ["typescript", "@types/", "eslint", "prettier", "vitest", "jest", "@vitest/", "@testing-library/"];
    for (const dep of Object.keys(pkg.dependencies || {})) {
      for (const devPkg of devPkgs) {
        if (dep.startsWith(devPkg) || dep.includes(devPkg)) {
          if (!pkg.devDependencies) pkg.devDependencies = {};
          pkg.devDependencies[dep] = pkg.dependencies[dep];
          delete pkg.dependencies[dep];
          updated.push(`moved:${dep}`);
        }
      }
    }

    // Add scripts if missing
    if (!pkg.scripts) pkg.scripts = {};
    const defaultScripts: Record<string, string> = {
      "type-check": "tsc --noEmit",
      lint: "eslint . --ext .ts,.tsx",
      format: "prettier --write .",
    };

    for (const [name, cmd] of Object.entries(defaultScripts)) {
      if (!pkg.scripts[name]) {
        pkg.scripts[name] = cmd;
        updated.push(`script:${name}`);
      }
    }

    if (updated.length > 0) {
      await ctx.write("package.json", JSON.stringify(pkg, null, 2) + "\n");
    }

    logAction(ctx, "fix:package-json", CODE.OK);
    return ok({ updated });
  },
};

export const fixCiWorkflow: Cmd<Record<string, never>, { created: boolean }> = {
  name: "fix:ci-workflow",
  description: "Create GitHub Actions CI workflow",
  schema: z.object({}),
  async exec(_, ctx) {
    if (await ctx.exists(".github/workflows/ci.yml") || await ctx.exists(".github/workflows/ci.yaml")) {
      return ok({ created: false });
    }

    const workflow = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
`;

    await ctx.write(".github/workflows/ci.yml", workflow);
    logAction(ctx, "fix:ci-workflow", CODE.OK);
    return ok({ created: true });
  },
};

// ============================================================================
// Full Cleanup
// ============================================================================

export const cleanupAuto: Cmd<Record<string, never>, { results: FixResult[] }> = {
  name: "cleanup:auto",
  description: "Automatically fix all auto-fixable issues",
  schema: z.object({}),
  async exec(_, ctx) {
    // Ensure we're not on a protected branch
    const { safe, branch } = await ensureSafeBranch(ctx);
    if (!safe) {
      return err(`cleanup:protected-branch:${branch}`, { branch });
    }

    const results: FixResult[] = [];
    const audit = ctx.state.audit;

    if (!audit) {
      return err("cleanup:no-audit");
    }

    ctx.log("info", "Starting auto-cleanup...");

    // Security fixes
    const gitignoreResult = await fixGitignore.exec({}, ctx);
    if (gitignoreResult.code === CODE.OK) {
      results.push({ issueId: "gitignore", fixed: true, action: "Updated .gitignore" });
    }

    const envResult = await fixEnvFiles.exec({}, ctx);
    if (envResult.code === CODE.OK && envResult.data?.removed.length) {
      results.push({ issueId: "env-files", fixed: true, action: `Removed ${envResult.data.removed.length} env files` });
    }

    // Quality fixes
    const tsconfigResult = await fixTsconfig.exec({}, ctx);
    if (tsconfigResult.code === CODE.OK && tsconfigResult.data?.updated.length) {
      results.push({ issueId: "tsconfig", fixed: true, action: "Updated tsconfig.json" });
    }

    const prettierResult = await fixPrettier.exec({}, ctx);
    if (prettierResult.code === CODE.OK && prettierResult.data?.created) {
      results.push({ issueId: "prettier", fixed: true, action: "Created .prettierrc" });
    }

    // Config fixes
    const nodeResult = await fixNodeVersion.exec({}, ctx);
    if (nodeResult.code === CODE.OK && nodeResult.data?.created) {
      results.push({ issueId: "node-version", fixed: true, action: "Created .nvmrc" });
    }

    const editorResult = await fixEditorconfig.exec({}, ctx);
    if (editorResult.code === CODE.OK && editorResult.data?.created) {
      results.push({ issueId: "editorconfig", fixed: true, action: "Created .editorconfig" });
    }

    const pkgResult = await fixPackageJson.exec({}, ctx);
    if (pkgResult.code === CODE.OK && pkgResult.data?.updated.length) {
      results.push({ issueId: "package-json", fixed: true, action: `Updated ${pkgResult.data.updated.length} items` });
    }

    const ciResult = await fixCiWorkflow.exec({}, ctx);
    if (ciResult.code === CODE.OK && ciResult.data?.created) {
      results.push({ issueId: "ci-workflow", fixed: true, action: "Created CI workflow" });
    }

    // NPM audit (run last as it modifies node_modules)
    if (audit.issues.some(i => i.category === "security" && i.title.includes("vulnerabilities"))) {
      const npmResult = await fixNpmAudit.exec({}, ctx);
      if (npmResult.code === CODE.OK && npmResult.data?.fixed) {
        results.push({ issueId: "npm-audit", fixed: true, action: `Fixed ${npmResult.data.fixed} vulnerabilities` });
      }
    }

    ctx.log("info", `Cleanup complete: ${results.length} fixes applied`);
    setPhase(ctx, "integrate");
    logAction(ctx, "cleanup:auto", CODE.OK);

    return ok({ results });
  },
};

export const cleanupCommit: Cmd<{ message?: string }, { committed: boolean; hash: string }> = {
  name: "cleanup:commit",
  description: "Commit cleanup changes",
  schema: z.object({ message: z.string().optional() }),
  async exec({ message }, ctx) {
    const { safe, branch } = await ensureSafeBranch(ctx);
    if (!safe) {
      return err(`cleanup:protected-branch:${branch}`);
    }

    // Stage all changes
    await ctx.exec("git add -A");

    // Check if there are changes
    const { stdout: status } = await ctx.exec("git status --porcelain");
    if (!status.trim()) {
      return ok({ committed: false, hash: "" });
    }

    // Commit
    const commitMsg = message || "chore: apply orchestrator cleanup fixes";
    const { code, stdout } = await ctx.exec(`git commit -m "${commitMsg}"`);

    if (code !== 0) {
      return err("cleanup:commit-failed");
    }

    const { stdout: hash } = await ctx.exec("git rev-parse --short HEAD");

    logAction(ctx, `cleanup:commit:${hash.trim()}`, CODE.OK);
    return ok({ committed: true, hash: hash.trim() });
  },
};

export const cleanupCmds = [
  fixGitignore, fixEnvFiles, fixNpmAudit,
  fixTsconfig, fixPrettier,
  fixNodeVersion, fixEditorconfig, fixPackageJson, fixCiWorkflow,
  cleanupAuto, cleanupCommit,
];
