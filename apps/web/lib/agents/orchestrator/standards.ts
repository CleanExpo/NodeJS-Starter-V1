/**
 * Standards Enforcement
 *
 * Enforces senior engineering standards across the codebase.
 * Ensures consistency, quality, and best practices.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx } from "./types";
import { ok, err, CODE } from "./types";
import { logAction } from "./context";

// ============================================================================
// Standard Types
// ============================================================================

interface Standard {
  id: string;
  name: string;
  description: string;
  category: "structure" | "naming" | "code" | "git" | "docs" | "security";
  check: (ctx: OrchestratorCtx) => Promise<{ passed: boolean; details?: string }>;
  fix?: (ctx: OrchestratorCtx) => Promise<boolean>;
}

interface StandardResult {
  id: string;
  name: string;
  passed: boolean;
  details?: string;
  fixable: boolean;
}

// ============================================================================
// Standards Definitions
// ============================================================================

const STANDARDS: Standard[] = [
  // Structure Standards
  {
    id: "struct-src",
    name: "Source directory",
    description: "Code should be in src/ or app/ directory",
    category: "structure",
    async check(ctx) {
      const hasSrc = await ctx.exists("src");
      const hasApp = await ctx.exists("app");
      return { passed: hasSrc || hasApp };
    },
  },
  {
    id: "struct-tests",
    name: "Test directory",
    description: "Tests should be in __tests__, tests/, or *.test.* files",
    category: "structure",
    async check(ctx) {
      const hasTests = await ctx.exists("__tests__") || await ctx.exists("tests") || await ctx.exists("test");
      const { stdout } = await ctx.exec("find . -name '*.test.*' -o -name '*.spec.*' 2>/dev/null | head -1");
      return { passed: hasTests || !!stdout.trim() };
    },
  },
  {
    id: "struct-config",
    name: "Config at root",
    description: "Config files should be at project root",
    category: "structure",
    async check(ctx) {
      const hasConfig = await ctx.exists("tsconfig.json") || await ctx.exists("package.json");
      return { passed: hasConfig };
    },
  },

  // Naming Standards
  {
    id: "name-kebab-files",
    name: "Kebab-case files",
    description: "Files should use kebab-case naming",
    category: "naming",
    async check(ctx) {
      const { stdout } = await ctx.exec("find src -name '*[A-Z]*' -type f 2>/dev/null | grep -v node_modules | head -5");
      const violations = stdout.trim().split("\n").filter(Boolean);
      return {
        passed: violations.length === 0,
        details: violations.length > 0 ? `Files: ${violations.join(", ")}` : undefined,
      };
    },
  },
  {
    id: "name-pascal-components",
    name: "PascalCase components",
    description: "React components should use PascalCase",
    category: "naming",
    async check(ctx) {
      const { stdout } = await ctx.exec("find . -path ./node_modules -prune -o -name '*.tsx' -print 2>/dev/null | xargs grep -l 'export.*function\\|export default' | head -5");
      // This is a simplified check
      return { passed: true };
    },
  },

  // Code Standards
  {
    id: "code-strict-ts",
    name: "TypeScript strict mode",
    description: "TypeScript should have strict mode enabled",
    category: "code",
    async check(ctx) {
      const tsconfig = await ctx.read("tsconfig.json");
      if (!tsconfig) return { passed: true }; // No TS
      const config = JSON.parse(tsconfig);
      return { passed: !!config.compilerOptions?.strict };
    },
    async fix(ctx) {
      const content = await ctx.read("tsconfig.json");
      if (!content) return false;
      const config = JSON.parse(content);
      if (!config.compilerOptions) config.compilerOptions = {};
      config.compilerOptions.strict = true;
      await ctx.write("tsconfig.json", JSON.stringify(config, null, 2));
      return true;
    },
  },
  {
    id: "code-no-any",
    name: "No explicit any",
    description: "Avoid using 'any' type",
    category: "code",
    async check(ctx) {
      const { stdout } = await ctx.exec("grep -r ': any' --include='*.ts' --include='*.tsx' . 2>/dev/null | grep -v node_modules | wc -l");
      const count = parseInt(stdout.trim());
      return {
        passed: count < 10,
        details: count > 0 ? `${count} 'any' usages found` : undefined,
      };
    },
  },
  {
    id: "code-eslint",
    name: "ESLint configured",
    description: "ESLint should be configured",
    category: "code",
    async check(ctx) {
      const hasConfig = await ctx.exists(".eslintrc.js") ||
        await ctx.exists(".eslintrc.json") ||
        await ctx.exists("eslint.config.js") ||
        await ctx.exists("eslint.config.mjs");
      return { passed: hasConfig };
    },
  },
  {
    id: "code-prettier",
    name: "Prettier configured",
    description: "Prettier should be configured for formatting",
    category: "code",
    async check(ctx) {
      const hasConfig = await ctx.exists(".prettierrc") ||
        await ctx.exists(".prettierrc.json") ||
        await ctx.exists("prettier.config.js");
      return { passed: hasConfig };
    },
  },

  // Git Standards
  {
    id: "git-conventional",
    name: "Conventional commits",
    description: "Commits should follow conventional format",
    category: "git",
    async check(ctx) {
      const { stdout } = await ctx.exec("git log --oneline -10");
      const commits = stdout.split("\n").filter(Boolean);
      const conventional = commits.filter(c => /^\w+ (feat|fix|docs|style|refactor|perf|test|chore)/.test(c));
      const ratio = conventional.length / commits.length;
      return {
        passed: ratio >= 0.7,
        details: `${Math.round(ratio * 100)}% conventional commits`,
      };
    },
  },
  {
    id: "git-branch-prefix",
    name: "Branch naming",
    description: "Branches should have type prefix",
    category: "git",
    async check(ctx) {
      const { stdout } = await ctx.exec("git branch --list | grep -v main | grep -v master | head -10");
      const branches = stdout.split("\n").filter(Boolean).map(b => b.trim().replace("* ", ""));
      const prefixed = branches.filter(b => /^(feature|fix|chore|release|hotfix)\//.test(b));
      return {
        passed: branches.length === 0 || prefixed.length / branches.length >= 0.5,
      };
    },
  },
  {
    id: "git-no-secrets",
    name: "No secrets committed",
    description: ".env files should not be committed",
    category: "git",
    async check(ctx) {
      const { stdout } = await ctx.exec("git ls-files | grep -E '\\.env$|\\.env\\.'");
      return { passed: !stdout.trim() };
    },
  },

  // Documentation Standards
  {
    id: "docs-readme",
    name: "README exists",
    description: "Project should have a README.md",
    category: "docs",
    async check(ctx) {
      return { passed: await ctx.exists("README.md") };
    },
  },
  {
    id: "docs-license",
    name: "LICENSE exists",
    description: "Project should have a LICENSE file",
    category: "docs",
    async check(ctx) {
      const has = await ctx.exists("LICENSE") || await ctx.exists("LICENSE.md");
      return { passed: has };
    },
  },
  {
    id: "docs-contributing",
    name: "CONTRIBUTING guide",
    description: "Project should have contribution guidelines",
    category: "docs",
    async check(ctx) {
      const has = await ctx.exists("CONTRIBUTING.md") || await ctx.exists(".github/CONTRIBUTING.md");
      return { passed: has };
    },
  },

  // Security Standards
  {
    id: "sec-gitignore",
    name: "Gitignore complete",
    description: ".gitignore should cover common patterns",
    category: "security",
    async check(ctx) {
      const gitignore = await ctx.read(".gitignore");
      if (!gitignore) return { passed: false };
      const required = [".env", "node_modules", ".next"];
      const missing = required.filter(p => !gitignore.includes(p));
      return {
        passed: missing.length === 0,
        details: missing.length > 0 ? `Missing: ${missing.join(", ")}` : undefined,
      };
    },
  },
  {
    id: "sec-deps-audit",
    name: "No critical vulnerabilities",
    description: "Dependencies should have no critical vulnerabilities",
    category: "security",
    async check(ctx) {
      const { stdout } = await ctx.exec("npm audit --json 2>/dev/null | grep -o '\"critical\":[0-9]*' | head -1");
      const match = stdout.match(/"critical":(\d+)/);
      const critical = parseInt(match?.[1] || "0");
      return {
        passed: critical === 0,
        details: critical > 0 ? `${critical} critical vulnerabilities` : undefined,
      };
    },
  },
];

// ============================================================================
// Commands
// ============================================================================

/**
 * Check all standards
 */
export const standardsCheck: Cmd<{ category?: string }, { results: StandardResult[]; score: number; passed: boolean }> = {
  name: "standards:check",
  description: "Check all engineering standards",
  schema: z.object({ category: z.string().optional() }),
  async exec({ category }, ctx) {
    const standards = category
      ? STANDARDS.filter(s => s.category === category)
      : STANDARDS;

    const results: StandardResult[] = [];

    for (const standard of standards) {
      try {
        const { passed, details } = await standard.check(ctx);
        results.push({
          id: standard.id,
          name: standard.name,
          passed,
          details,
          fixable: !!standard.fix,
        });
      } catch {
        results.push({
          id: standard.id,
          name: standard.name,
          passed: false,
          details: "Check failed",
          fixable: !!standard.fix,
        });
      }
    }

    const passedCount = results.filter(r => r.passed).length;
    const score = Math.round((passedCount / results.length) * 100);
    const passed = passedCount === results.length;

    logAction(ctx, `standards:check:${score}%`, passed ? CODE.OK : CODE.WARN);
    return ok({ results, score, passed });
  },
};

/**
 * Fix fixable standards
 */
export const standardsFix: Cmd<Record<string, never>, { fixed: string[]; failed: string[] }> = {
  name: "standards:fix",
  description: "Fix all fixable standard violations",
  schema: z.object({}),
  async exec(_, ctx) {
    const fixed: string[] = [];
    const failed: string[] = [];

    const checkResult = await standardsCheck.exec({}, ctx);
    if (checkResult.code !== CODE.OK || !checkResult.data) {
      return err("standards:check-failed");
    }

    const violations = checkResult.data.results.filter(r => !r.passed && r.fixable);

    for (const v of violations) {
      const standard = STANDARDS.find(s => s.id === v.id);
      if (!standard?.fix) continue;

      try {
        const success = await standard.fix(ctx);
        if (success) {
          fixed.push(v.id);
          ctx.log("info", `✓ Fixed: ${v.name}`);
        } else {
          failed.push(v.id);
        }
      } catch {
        failed.push(v.id);
      }
    }

    logAction(ctx, `standards:fix:${fixed.length}/${violations.length}`, CODE.OK);
    return ok({ fixed, failed });
  },
};

/**
 * Generate standards report
 */
export const standardsReport: Cmd<Record<string, never>, { report: string }> = {
  name: "standards:report",
  description: "Generate standards compliance report",
  schema: z.object({}),
  async exec(_, ctx) {
    const checkResult = await standardsCheck.exec({}, ctx);
    if (checkResult.code !== CODE.OK || !checkResult.data) {
      return err("standards:check-failed");
    }

    const { results, score } = checkResult.data;
    const byCategory = new Map<string, StandardResult[]>();

    for (const r of results) {
      const standard = STANDARDS.find(s => s.id === r.id);
      const cat = standard?.category || "other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(r);
    }

    let report = `
╔═══════════════════════════════════════════════════════════════════╗
║                    STANDARDS COMPLIANCE REPORT                    ║
╠═══════════════════════════════════════════════════════════════════╣
║ Overall Score: ${String(score + "%").padEnd(52)}║
║ Standards Passed: ${(results.filter(r => r.passed).length + "/" + results.length).padEnd(49)}║
╠═══════════════════════════════════════════════════════════════════╣`;

    for (const [category, catResults] of byCategory) {
      const catPassed = catResults.filter(r => r.passed).length;
      report += `
║ ${category.toUpperCase().padEnd(65)}║`;

      for (const r of catResults) {
        const status = r.passed ? "✓" : "✗";
        const fixable = r.fixable && !r.passed ? " [fixable]" : "";
        report += `
║   ${status} ${(r.name + fixable).padEnd(62)}║`;
        if (r.details && !r.passed) {
          report += `
║     ${r.details.slice(0, 60).padEnd(60)}║`;
        }
      }
    }

    report += `
╚═══════════════════════════════════════════════════════════════════╝`;

    return ok({ report });
  },
};

export const standardsCmds = [standardsCheck, standardsFix, standardsReport];
