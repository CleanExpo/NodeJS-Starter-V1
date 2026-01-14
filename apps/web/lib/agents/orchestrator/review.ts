/**
 * Code Review System
 *
 * Automated code review with senior engineer standards.
 * Reviews changes for quality, security, and best practices.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx } from "./types";
import { ok, err, CODE } from "./types";
import { logAction } from "./context";

// ============================================================================
// Review Types
// ============================================================================

type ReviewSeverity = "blocker" | "critical" | "major" | "minor" | "suggestion";
type ReviewCategory = "security" | "performance" | "quality" | "style" | "testing" | "docs";

interface ReviewComment {
  file: string;
  line?: number;
  severity: ReviewSeverity;
  category: ReviewCategory;
  message: string;
  suggestion?: string;
}

interface ReviewResult {
  approved: boolean;
  score: number; // 0-100
  comments: ReviewComment[];
  summary: {
    blockers: number;
    critical: number;
    major: number;
    minor: number;
    suggestions: number;
  };
  stats: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

// ============================================================================
// Review Patterns
// ============================================================================

interface ReviewPattern {
  pattern: RegExp;
  severity: ReviewSeverity;
  category: ReviewCategory;
  message: string;
  suggestion?: string;
}

const REVIEW_PATTERNS: ReviewPattern[] = [
  // Security
  {
    pattern: /eval\s*\(/,
    severity: "blocker",
    category: "security",
    message: "eval() is a security risk",
    suggestion: "Use safer alternatives like JSON.parse() or Function constructor",
  },
  {
    pattern: /innerHTML\s*=/,
    severity: "critical",
    category: "security",
    message: "innerHTML can lead to XSS vulnerabilities",
    suggestion: "Use textContent or sanitize input with DOMPurify",
  },
  {
    pattern: /dangerouslySetInnerHTML/,
    severity: "major",
    category: "security",
    message: "dangerouslySetInnerHTML requires careful sanitization",
    suggestion: "Ensure content is sanitized before use",
  },
  {
    pattern: /process\.env\.[A-Z_]+(?!\s*\|\|)/,
    severity: "minor",
    category: "security",
    message: "Environment variable used without fallback",
    suggestion: "Add fallback value for missing env vars",
  },

  // Performance
  {
    pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*\}\s*\)/,
    severity: "major",
    category: "performance",
    message: "useEffect with no dependency array runs on every render",
    suggestion: "Add dependency array: useEffect(() => {}, [])",
  },
  {
    pattern: /\.map\([^)]+\)\.filter\(/,
    severity: "minor",
    category: "performance",
    message: "map().filter() can be optimized",
    suggestion: "Use reduce() or filter() first, then map()",
  },
  {
    pattern: /JSON\.parse\(JSON\.stringify\(/,
    severity: "minor",
    category: "performance",
    message: "Deep clone with JSON is slow for large objects",
    suggestion: "Use structuredClone() or a library like lodash.cloneDeep",
  },
  {
    pattern: /new Date\(\).*new Date\(\)/,
    severity: "suggestion",
    category: "performance",
    message: "Multiple Date instantiations",
    suggestion: "Create Date once and reuse",
  },

  // Quality
  {
    pattern: /console\.(log|debug|info)\(/,
    severity: "minor",
    category: "quality",
    message: "Console statement in production code",
    suggestion: "Remove or use proper logging library",
  },
  {
    pattern: /\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK/i,
    severity: "suggestion",
    category: "quality",
    message: "TODO/FIXME comment found",
    suggestion: "Create issue or resolve before merging",
  },
  {
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
    severity: "major",
    category: "quality",
    message: "Empty catch block silences errors",
    suggestion: "Handle or log the error appropriately",
  },
  {
    pattern: /any(?:\s|[,\)>])/,
    severity: "minor",
    category: "quality",
    message: "TypeScript 'any' type reduces type safety",
    suggestion: "Use specific types or 'unknown'",
  },
  {
    pattern: /!important/,
    severity: "minor",
    category: "style",
    message: "!important in CSS overrides specificity",
    suggestion: "Use more specific selectors instead",
  },

  // Testing
  {
    pattern: /\.skip\s*\(/,
    severity: "major",
    category: "testing",
    message: "Skipped test found",
    suggestion: "Remove .skip or delete the test",
  },
  {
    pattern: /\.only\s*\(/,
    severity: "blocker",
    category: "testing",
    message: ".only will skip other tests in CI",
    suggestion: "Remove .only before merging",
  },
];

// ============================================================================
// Commands
// ============================================================================

/**
 * Review staged changes
 */
export const reviewStaged: Cmd<Record<string, never>, ReviewResult> = {
  name: "review:staged",
  description: "Review staged changes for issues",
  schema: z.object({}),
  async exec(_, ctx) {
    const comments: ReviewComment[] = [];

    // Get staged diff
    const { stdout: diff } = await ctx.exec("git diff --cached --unified=0");
    if (!diff.trim()) {
      return ok({
        approved: true,
        score: 100,
        comments: [],
        summary: { blockers: 0, critical: 0, major: 0, minor: 0, suggestions: 0 },
        stats: { filesChanged: 0, additions: 0, deletions: 0 },
      });
    }

    // Parse diff
    const files = parseDiff(diff);

    // Get stats
    const { stdout: stats } = await ctx.exec("git diff --cached --shortstat");
    const statsMatch = stats.match(/(\d+) files? changed(?:, (\d+) insertions?)?(?:, (\d+) deletions?)?/);
    const reviewStats = {
      filesChanged: parseInt(statsMatch?.[1] || "0"),
      additions: parseInt(statsMatch?.[2] || "0"),
      deletions: parseInt(statsMatch?.[3] || "0"),
    };

    // Review each file
    for (const file of files) {
      for (const pattern of REVIEW_PATTERNS) {
        for (const line of file.addedLines) {
          if (pattern.pattern.test(line.content)) {
            comments.push({
              file: file.path,
              line: line.number,
              severity: pattern.severity,
              category: pattern.category,
              message: pattern.message,
              suggestion: pattern.suggestion,
            });
          }
        }
      }
    }

    // Calculate summary
    const summary = {
      blockers: comments.filter(c => c.severity === "blocker").length,
      critical: comments.filter(c => c.severity === "critical").length,
      major: comments.filter(c => c.severity === "major").length,
      minor: comments.filter(c => c.severity === "minor").length,
      suggestions: comments.filter(c => c.severity === "suggestion").length,
    };

    // Calculate score
    let score = 100;
    score -= summary.blockers * 25;
    score -= summary.critical * 15;
    score -= summary.major * 8;
    score -= summary.minor * 3;
    score -= summary.suggestions * 1;
    score = Math.max(0, score);

    const approved = summary.blockers === 0 && summary.critical === 0;

    logAction(ctx, `review:staged:${approved ? "approved" : "blocked"}`, approved ? CODE.OK : CODE.WARN);

    return ok({
      approved,
      score,
      comments,
      summary,
      stats: reviewStats,
    });
  },
};

/**
 * Review specific file
 */
export const reviewFile: Cmd<{ path: string }, { comments: ReviewComment[] }> = {
  name: "review:file",
  description: "Review specific file for issues",
  schema: z.object({ path: z.string() }),
  async exec({ path }, ctx) {
    const content = await ctx.read(path);
    if (!content) {
      return err(`review:file-not-found:${path}`);
    }

    const comments: ReviewComment[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of REVIEW_PATTERNS) {
        if (pattern.pattern.test(line)) {
          comments.push({
            file: path,
            line: i + 1,
            severity: pattern.severity,
            category: pattern.category,
            message: pattern.message,
            suggestion: pattern.suggestion,
          });
        }
      }
    }

    return ok({ comments });
  },
};

/**
 * Review branch changes
 */
export const reviewBranch: Cmd<{ base?: string }, ReviewResult> = {
  name: "review:branch",
  description: "Review all changes in current branch vs base",
  schema: z.object({ base: z.string().optional() }),
  async exec({ base = "main" }, ctx) {
    const comments: ReviewComment[] = [];

    // Get branch diff
    const { stdout: diff } = await ctx.exec(`git diff ${base}...HEAD --unified=0`);
    if (!diff.trim()) {
      return ok({
        approved: true,
        score: 100,
        comments: [],
        summary: { blockers: 0, critical: 0, major: 0, minor: 0, suggestions: 0 },
        stats: { filesChanged: 0, additions: 0, deletions: 0 },
      });
    }

    const files = parseDiff(diff);

    // Get stats
    const { stdout: stats } = await ctx.exec(`git diff ${base}...HEAD --shortstat`);
    const statsMatch = stats.match(/(\d+) files? changed(?:, (\d+) insertions?)?(?:, (\d+) deletions?)?/);
    const reviewStats = {
      filesChanged: parseInt(statsMatch?.[1] || "0"),
      additions: parseInt(statsMatch?.[2] || "0"),
      deletions: parseInt(statsMatch?.[3] || "0"),
    };

    // Review
    for (const file of files) {
      for (const pattern of REVIEW_PATTERNS) {
        for (const line of file.addedLines) {
          if (pattern.pattern.test(line.content)) {
            comments.push({
              file: file.path,
              line: line.number,
              severity: pattern.severity,
              category: pattern.category,
              message: pattern.message,
              suggestion: pattern.suggestion,
            });
          }
        }
      }
    }

    const summary = {
      blockers: comments.filter(c => c.severity === "blocker").length,
      critical: comments.filter(c => c.severity === "critical").length,
      major: comments.filter(c => c.severity === "major").length,
      minor: comments.filter(c => c.severity === "minor").length,
      suggestions: comments.filter(c => c.severity === "suggestion").length,
    };

    let score = 100;
    score -= summary.blockers * 25;
    score -= summary.critical * 15;
    score -= summary.major * 8;
    score -= summary.minor * 3;
    score = Math.max(0, score);

    const approved = summary.blockers === 0 && summary.critical === 0;

    logAction(ctx, `review:branch:${approved ? "approved" : "blocked"}`, approved ? CODE.OK : CODE.WARN);

    return ok({
      approved,
      score,
      comments,
      summary,
      stats: reviewStats,
    });
  },
};

/**
 * Format review as report
 */
export const reviewReport: Cmd<Record<string, never>, { report: string }> = {
  name: "review:report",
  description: "Generate review report for staged changes",
  schema: z.object({}),
  async exec(_, ctx) {
    const result = await reviewStaged.exec({}, ctx);
    if (result.code !== CODE.OK || !result.data) {
      return err("review:failed");
    }

    const r = result.data;
    let report = `
╔═══════════════════════════════════════════════════════════════════╗
║                        CODE REVIEW REPORT                         ║
╠═══════════════════════════════════════════════════════════════════╣
║ Status: ${(r.approved ? "✓ APPROVED" : "✗ BLOCKED").padEnd(56)}║
║ Score: ${String(r.score).padEnd(57)}║
╠═══════════════════════════════════════════════════════════════════╣
║ SUMMARY                                                           ║
║ Blockers: ${String(r.summary.blockers).padEnd(54)}║
║ Critical: ${String(r.summary.critical).padEnd(54)}║
║ Major: ${String(r.summary.major).padEnd(57)}║
║ Minor: ${String(r.summary.minor).padEnd(57)}║
║ Suggestions: ${String(r.summary.suggestions).padEnd(51)}║
╠═══════════════════════════════════════════════════════════════════╣
║ STATS                                                             ║
║ Files: ${String(r.stats.filesChanged).padEnd(57)}║
║ Added: +${String(r.stats.additions).padEnd(56)}║
║ Removed: -${String(r.stats.deletions).padEnd(54)}║`;

    if (r.comments.length > 0) {
      report += `
╠═══════════════════════════════════════════════════════════════════╣
║ ISSUES                                                            ║`;

      for (const c of r.comments.slice(0, 10)) {
        const location = c.line ? `${c.file}:${c.line}` : c.file;
        report += `
║ [${c.severity.toUpperCase().padEnd(10)}] ${location.slice(0, 50).padEnd(50)}║
║   ${c.message.slice(0, 62).padEnd(62)}║`;
      }

      if (r.comments.length > 10) {
        report += `
║ ... and ${r.comments.length - 10} more issues                                          ║`;
      }
    }

    report += `
╚═══════════════════════════════════════════════════════════════════╝`;

    return ok({ report });
  },
};

// ============================================================================
// Helpers
// ============================================================================

interface DiffFile {
  path: string;
  addedLines: Array<{ number: number; content: string }>;
}

function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  const lines = diff.split("\n");

  let currentFile: DiffFile | null = null;
  let lineNumber = 0;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (currentFile) files.push(currentFile);
      const match = line.match(/diff --git a\/.+ b\/(.+)/);
      currentFile = { path: match?.[1] || "unknown", addedLines: [] };
    } else if (line.startsWith("@@")) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)/);
      lineNumber = parseInt(match?.[1] || "0");
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      if (currentFile) {
        currentFile.addedLines.push({ number: lineNumber, content: line.slice(1) });
      }
      lineNumber++;
    } else if (!line.startsWith("-")) {
      lineNumber++;
    }
  }

  if (currentFile) files.push(currentFile);
  return files;
}

export const reviewCmds = [reviewStaged, reviewFile, reviewBranch, reviewReport];
