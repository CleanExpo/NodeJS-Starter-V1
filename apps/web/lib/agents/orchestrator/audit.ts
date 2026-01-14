/**
 * Audit Module
 *
 * Comprehensive health checks for security, performance, quality, and configuration.
 * Identifies issues and provides fix recommendations.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx, Issue, AuditResult, Severity, IssueCategory } from "./types";
import { ok, err, CODE } from "./types";
import { saveState, setPhase, logAction } from "./context";

// ============================================================================
// Issue Helpers
// ============================================================================

let issueCounter = 0;

function issue(
  category: IssueCategory,
  severity: Severity,
  title: string,
  description: string,
  opts: { file?: string; line?: number; fix?: string; autoFixable?: boolean } = {}
): Issue {
  return {
    id: `${category}-${++issueCounter}`,
    category,
    severity,
    title,
    description,
    file: opts.file,
    line: opts.line,
    fix: opts.fix,
    autoFixable: opts.autoFixable ?? false,
  };
}

function calculateGrade(score: number): AuditResult["grade"] {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

// ============================================================================
// Security Audit
// ============================================================================

export const auditSecurity: Cmd<Record<string, never>, { issues: Issue[]; passed: boolean }> = {
  name: "audit:security",
  description: "Check for security vulnerabilities",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: Issue[] = [];
    ctx.log("info", "Running security audit...");

    // Check for .env files committed
    const { stdout: gitFiles } = await ctx.exec("git ls-files");
    const trackedFiles = gitFiles.split("\n");

    for (const file of trackedFiles) {
      if (file.match(/\.env($|\.local|\.prod|\.dev)/)) {
        issues.push(issue("security", "critical", "Env file committed", `${file} is tracked in git`, {
          file,
          fix: `Add to .gitignore and remove: git rm --cached ${file}`,
          autoFixable: true,
        }));
      }
    }

    // Check .gitignore for sensitive patterns
    const gitignore = await ctx.read(".gitignore");
    const requiredPatterns = [".env", ".env.*", "*.pem", "*.key", "credentials.json"];

    if (gitignore) {
      for (const pattern of requiredPatterns) {
        if (!gitignore.includes(pattern)) {
          issues.push(issue("security", "high", "Missing gitignore pattern", `${pattern} not in .gitignore`, {
            file: ".gitignore",
            fix: `Add "${pattern}" to .gitignore`,
            autoFixable: true,
          }));
        }
      }
    }

    // Check for hardcoded secrets patterns
    const sourceFiles = await ctx.glob("**/*.{ts,tsx,js,jsx,py}");
    const secretPatterns = [
      /(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']+["']/gi,
      /(?:secret[_-]?key|secretkey)\s*[:=]\s*["'][^"']+["']/gi,
      /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']+["']/gi,
      /sk-[a-zA-Z0-9]{20,}/g, // OpenAI-style keys
      /ghp_[a-zA-Z0-9]{36}/g, // GitHub tokens
    ];

    for (const file of sourceFiles.slice(0, 50)) { // Limit for performance
      const content = await ctx.read(file);
      if (!content) continue;

      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          issues.push(issue("security", "critical", "Potential hardcoded secret", `Possible secret in ${file}`, {
            file,
            fix: "Move to environment variables",
            autoFixable: false,
          }));
          break;
        }
      }
    }

    // npm audit
    if (await ctx.exists("package.json")) {
      const { stdout, code } = await ctx.exec("npm audit --json 2>/dev/null || echo '{}'", { timeout: 60000 });
      try {
        const audit = JSON.parse(stdout);
        if (audit.metadata?.vulnerabilities) {
          const { critical, high, moderate } = audit.metadata.vulnerabilities;
          if (critical > 0) {
            issues.push(issue("security", "critical", "Critical npm vulnerabilities", `${critical} critical vulnerabilities found`, {
              fix: "Run: npm audit fix --force",
              autoFixable: true,
            }));
          }
          if (high > 0) {
            issues.push(issue("security", "high", "High npm vulnerabilities", `${high} high vulnerabilities found`, {
              fix: "Run: npm audit fix",
              autoFixable: true,
            }));
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    logAction(ctx, "audit:security", issues.length === 0 ? CODE.OK : CODE.WARN);
    return ok({ issues, passed: issues.filter(i => i.severity === "critical").length === 0 });
  },
};

// ============================================================================
// Performance Audit
// ============================================================================

export const auditPerformance: Cmd<Record<string, never>, { issues: Issue[]; passed: boolean }> = {
  name: "audit:performance",
  description: "Check for performance issues",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: Issue[] = [];
    ctx.log("info", "Running performance audit...");

    // Check bundle size (Next.js)
    if (await ctx.exists(".next/static")) {
      const { stdout } = await ctx.exec("du -sk .next/static 2>/dev/null || echo '0'");
      const sizeKb = parseInt(stdout.split("\t")[0]);
      if (sizeKb > 5000) { // 5MB
        issues.push(issue("performance", "high", "Large bundle size", `Build output is ${Math.round(sizeKb / 1024)}MB`, {
          fix: "Analyze with: npx @next/bundle-analyzer",
        }));
      }
    }

    // Check for heavy dependencies
    const pkg = await ctx.read("package.json");
    if (pkg) {
      const parsed = JSON.parse(pkg);
      const heavyDeps = ["moment", "lodash", "jquery", "underscore"];
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };

      for (const dep of heavyDeps) {
        if (deps[dep]) {
          issues.push(issue("performance", "medium", "Heavy dependency", `${dep} adds significant bundle size`, {
            fix: dep === "moment" ? "Use date-fns or dayjs" : dep === "lodash" ? "Use lodash-es or native methods" : "Consider lighter alternatives",
            autoFixable: false,
          }));
        }
      }
    }

    // Check for missing optimization configs
    if (ctx.state.project?.type === "nextjs") {
      const nextConfig = await ctx.read("next.config.js") || await ctx.read("next.config.mjs") || await ctx.read("next.config.ts");
      if (nextConfig) {
        if (!nextConfig.includes("images")) {
          issues.push(issue("performance", "low", "Image optimization not configured", "Next.js image domains not set", {
            fix: "Add images config to next.config.js",
            autoFixable: false,
          }));
        }
      }
    }

    // Check for N+1 patterns in API routes
    const apiFiles = await ctx.glob("**/api/**/*.{ts,js}");
    for (const file of apiFiles.slice(0, 20)) {
      const content = await ctx.read(file);
      if (!content) continue;

      // Detect loops with await inside
      if (/for\s*\([^)]+\)\s*\{[^}]*await\s+/s.test(content)) {
        issues.push(issue("performance", "high", "Potential N+1 query", `Sequential awaits in loop detected`, {
          file,
          fix: "Use Promise.all() for parallel execution",
          autoFixable: false,
        }));
      }
    }

    logAction(ctx, "audit:performance", issues.length === 0 ? CODE.OK : CODE.WARN);
    return ok({ issues, passed: issues.filter(i => i.severity === "critical" || i.severity === "high").length === 0 });
  },
};

// ============================================================================
// Code Quality Audit
// ============================================================================

export const auditQuality: Cmd<Record<string, never>, { issues: Issue[]; passed: boolean }> = {
  name: "audit:quality",
  description: "Check code quality standards",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: Issue[] = [];
    ctx.log("info", "Running quality audit...");

    // Check TypeScript strict mode
    const tsconfig = await ctx.read("tsconfig.json");
    if (tsconfig) {
      const parsed = JSON.parse(tsconfig);
      if (!parsed.compilerOptions?.strict) {
        issues.push(issue("quality", "medium", "TypeScript strict mode disabled", "Strict type checking is not enabled", {
          file: "tsconfig.json",
          fix: 'Add "strict": true to compilerOptions',
          autoFixable: true,
        }));
      }
      if (!parsed.compilerOptions?.noUncheckedIndexedAccess) {
        issues.push(issue("quality", "low", "Unchecked indexed access", "Array/object access not type-safe", {
          file: "tsconfig.json",
          fix: 'Add "noUncheckedIndexedAccess": true',
          autoFixable: true,
        }));
      }
    }

    // Check for ESLint
    if (!ctx.state.project?.hasLinting) {
      issues.push(issue("quality", "medium", "No linting configured", "ESLint is not set up", {
        fix: "Run: npx eslint --init",
        autoFixable: false,
      }));
    }

    // Check for Prettier
    const hasPrettier = await ctx.exists(".prettierrc") || await ctx.exists(".prettierrc.json") || await ctx.exists("prettier.config.js");
    if (!hasPrettier) {
      issues.push(issue("quality", "low", "No formatter configured", "Prettier is not set up", {
        fix: "Run: npm install -D prettier && echo '{}' > .prettierrc",
        autoFixable: true,
      }));
    }

    // Run TypeScript check
    if (ctx.state.project?.hasTypescript) {
      const { stdout, code } = await ctx.exec("npx tsc --noEmit 2>&1 | head -20 || true", { timeout: 120000 });
      if (code !== 0 && stdout.includes("error TS")) {
        const errorCount = (stdout.match(/error TS/g) || []).length;
        issues.push(issue("quality", "high", "TypeScript errors", `${errorCount}+ type errors found`, {
          fix: "Run: npx tsc --noEmit to see all errors",
          autoFixable: false,
        }));
      }
    }

    // Check for console.log in production code
    const srcFiles = await ctx.glob("src/**/*.{ts,tsx,js,jsx}");
    for (const file of srcFiles.slice(0, 30)) {
      const content = await ctx.read(file);
      if (!content) continue;

      const consoleMatches = content.match(/console\.(log|debug|info)\(/g);
      if (consoleMatches && consoleMatches.length > 3) {
        issues.push(issue("quality", "low", "Console statements", `${consoleMatches.length} console statements in ${file}`, {
          file,
          fix: "Remove or use proper logging",
          autoFixable: false,
        }));
      }
    }

    // Check for TODO/FIXME comments
    const { stdout: todoCount } = await ctx.exec("grep -r 'TODO\\|FIXME\\|HACK\\|XXX' --include='*.ts' --include='*.tsx' . 2>/dev/null | wc -l || echo '0'");
    const todos = parseInt(todoCount.trim());
    if (todos > 10) {
      issues.push(issue("quality", "info", "Outstanding TODOs", `${todos} TODO/FIXME comments found`, {
        fix: "Review and address TODO items",
        autoFixable: false,
      }));
    }

    logAction(ctx, "audit:quality", issues.length === 0 ? CODE.OK : CODE.WARN);
    return ok({ issues, passed: issues.filter(i => i.severity === "critical" || i.severity === "high").length === 0 });
  },
};

// ============================================================================
// Dependencies Audit
// ============================================================================

export const auditDeps: Cmd<Record<string, never>, { issues: Issue[]; passed: boolean }> = {
  name: "audit:deps",
  description: "Check dependency health",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: Issue[] = [];
    ctx.log("info", "Running dependency audit...");

    // Check for outdated packages
    const { stdout } = await ctx.exec("npm outdated --json 2>/dev/null || echo '{}'", { timeout: 60000 });
    try {
      const outdated = JSON.parse(stdout);
      const outdatedCount = Object.keys(outdated).length;

      if (outdatedCount > 20) {
        issues.push(issue("deps", "medium", "Many outdated packages", `${outdatedCount} packages are outdated`, {
          fix: "Run: npm update",
          autoFixable: true,
        }));
      }

      // Check for major version updates
      for (const [pkg, info] of Object.entries(outdated) as Array<[string, { current: string; latest: string }]>) {
        const current = info.current?.split(".")[0];
        const latest = info.latest?.split(".")[0];
        if (current && latest && parseInt(latest) > parseInt(current)) {
          issues.push(issue("deps", "medium", "Major version available", `${pkg}: ${info.current} → ${info.latest}`, {
            fix: `npm install ${pkg}@latest`,
            autoFixable: false,
          }));
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Check for duplicate dependencies
    const { stdout: duplicates } = await ctx.exec("npm ls --json 2>/dev/null | grep -o '\"name\":' | wc -l || echo '0'");

    // Check package.json issues
    const pkg = await ctx.read("package.json");
    if (pkg) {
      const parsed = JSON.parse(pkg);

      // Check for missing fields
      if (!parsed.engines) {
        issues.push(issue("deps", "low", "Missing engines field", "Node.js version not specified", {
          file: "package.json",
          fix: 'Add "engines": { "node": ">=18" }',
          autoFixable: true,
        }));
      }

      // Check for dependencies that should be devDependencies
      const devOnlyPkgs = ["typescript", "@types/", "eslint", "prettier", "vitest", "jest"];
      for (const dep of Object.keys(parsed.dependencies || {})) {
        for (const devPkg of devOnlyPkgs) {
          if (dep.includes(devPkg)) {
            issues.push(issue("deps", "low", "Misplaced dependency", `${dep} should be in devDependencies`, {
              file: "package.json",
              fix: `Move ${dep} to devDependencies`,
              autoFixable: true,
            }));
          }
        }
      }
    }

    logAction(ctx, "audit:deps", issues.length === 0 ? CODE.OK : CODE.WARN);
    return ok({ issues, passed: issues.filter(i => i.severity === "critical" || i.severity === "high").length === 0 });
  },
};

// ============================================================================
// Configuration Audit
// ============================================================================

export const auditConfig: Cmd<Record<string, never>, { issues: Issue[]; passed: boolean }> = {
  name: "audit:config",
  description: "Check project configuration",
  schema: z.object({}),
  async exec(_, ctx) {
    const issues: Issue[] = [];
    ctx.log("info", "Running configuration audit...");

    // Check for .nvmrc or .node-version
    if (!await ctx.exists(".nvmrc") && !await ctx.exists(".node-version")) {
      issues.push(issue("config", "low", "No Node version file", "Node.js version not pinned", {
        fix: "echo '20' > .nvmrc",
        autoFixable: true,
      }));
    }

    // Check for .editorconfig
    if (!await ctx.exists(".editorconfig")) {
      issues.push(issue("config", "low", "No EditorConfig", "Editor settings not standardized", {
        fix: "Create .editorconfig with standard settings",
        autoFixable: true,
      }));
    }

    // Check git hooks
    if (!await ctx.exists(".husky") && !await ctx.exists(".git/hooks/pre-commit")) {
      issues.push(issue("config", "medium", "No git hooks", "Pre-commit hooks not configured", {
        fix: "Run: npx husky install",
        autoFixable: true,
      }));
    }

    // Check for CI/CD
    if (!ctx.state.project?.hasCi) {
      issues.push(issue("config", "medium", "No CI/CD", "No GitHub Actions or CI configuration", {
        fix: "Create .github/workflows/ci.yml",
        autoFixable: true,
      }));
    }

    // Check README
    if (!await ctx.exists("README.md")) {
      issues.push(issue("config", "medium", "No README", "Project documentation missing", {
        fix: "Create README.md with project info",
        autoFixable: true,
      }));
    }

    // Check LICENSE
    if (!await ctx.exists("LICENSE") && !await ctx.exists("LICENSE.md")) {
      issues.push(issue("config", "low", "No LICENSE", "License file missing", {
        fix: "Add appropriate LICENSE file",
        autoFixable: false,
      }));
    }

    logAction(ctx, "audit:config", issues.length === 0 ? CODE.OK : CODE.WARN);
    return ok({ issues, passed: issues.filter(i => i.severity === "critical" || i.severity === "high").length === 0 });
  },
};

// ============================================================================
// Full Audit
// ============================================================================

export const auditFull: Cmd<Record<string, never>, AuditResult> = {
  name: "audit:full",
  description: "Run complete audit across all categories",
  schema: z.object({}),
  async exec(_, ctx) {
    ctx.log("info", "Starting full audit...");
    issueCounter = 0; // Reset counter

    const allIssues: Issue[] = [];
    const checks = {
      security: false,
      performance: false,
      quality: false,
      deps: false,
      config: false,
    };

    // Run all audits
    const securityResult = await auditSecurity.exec({}, ctx);
    if (securityResult.code === CODE.OK && securityResult.data) {
      allIssues.push(...securityResult.data.issues);
      checks.security = securityResult.data.passed;
    }

    const perfResult = await auditPerformance.exec({}, ctx);
    if (perfResult.code === CODE.OK && perfResult.data) {
      allIssues.push(...perfResult.data.issues);
      checks.performance = perfResult.data.passed;
    }

    const qualityResult = await auditQuality.exec({}, ctx);
    if (qualityResult.code === CODE.OK && qualityResult.data) {
      allIssues.push(...qualityResult.data.issues);
      checks.quality = qualityResult.data.passed;
    }

    const depsResult = await auditDeps.exec({}, ctx);
    if (depsResult.code === CODE.OK && depsResult.data) {
      allIssues.push(...depsResult.data.issues);
      checks.deps = depsResult.data.passed;
    }

    const configResult = await auditConfig.exec({}, ctx);
    if (configResult.code === CODE.OK && configResult.data) {
      allIssues.push(...configResult.data.issues);
      checks.config = configResult.data.passed;
    }

    // Calculate summary
    const summary = {
      critical: allIssues.filter(i => i.severity === "critical").length,
      high: allIssues.filter(i => i.severity === "high").length,
      medium: allIssues.filter(i => i.severity === "medium").length,
      low: allIssues.filter(i => i.severity === "low").length,
      info: allIssues.filter(i => i.severity === "info").length,
    };

    // Calculate score (100 - weighted deductions)
    let score = 100;
    score -= summary.critical * 15;
    score -= summary.high * 8;
    score -= summary.medium * 3;
    score -= summary.low * 1;
    score = Math.max(0, Math.min(100, score));

    const result: AuditResult = {
      score,
      grade: calculateGrade(score),
      issues: allIssues,
      summary,
      checks,
      ts: Date.now(),
    };

    ctx.state.audit = result;
    saveState(ctx);

    ctx.log("info", `Audit complete: Grade ${result.grade} (${score}/100)`);
    ctx.log("info", `Issues: ${summary.critical} critical, ${summary.high} high, ${summary.medium} medium`);

    setPhase(ctx, "cleanup");
    logAction(ctx, "audit:full", CODE.OK);

    return ok(result);
  },
};

export const auditCmds = [auditSecurity, auditPerformance, auditQuality, auditDeps, auditConfig, auditFull];
