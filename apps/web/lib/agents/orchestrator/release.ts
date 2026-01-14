/**
 * Release Manager
 *
 * Semantic versioning, changelogs, and release automation.
 * Follows senior engineering practices for release management.
 */

import { z } from "zod";
import type { Cmd, OrchestratorCtx } from "./types";
import { ok, err, CODE } from "./types";
import { logAction, getCurrentBranch, isProtectedBranch } from "./context";
import { isProd, isDemo } from "./modes";

// ============================================================================
// Types
// ============================================================================

type ReleaseType = "major" | "minor" | "patch" | "prerelease";
type CommitType = "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "chore" | "breaking";

interface ParsedCommit {
  hash: string;
  type: CommitType;
  scope?: string;
  message: string;
  breaking: boolean;
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    breaking: string[];
    features: string[];
    fixes: string[];
    other: string[];
  };
}

// ============================================================================
// Version Commands
// ============================================================================

/**
 * Get current version
 */
export const releaseVersion: Cmd<Record<string, never>, { version: string; source: string }> = {
  name: "release:version",
  description: "Get current project version",
  schema: z.object({}),
  async exec(_, ctx) {
    // Try package.json
    const pkg = await ctx.read("package.json");
    if (pkg) {
      const parsed = JSON.parse(pkg);
      if (parsed.version) {
        return ok({ version: parsed.version, source: "package.json" });
      }
    }

    // Try git tag
    const { stdout: tag } = await ctx.exec("git describe --tags --abbrev=0 2>/dev/null || echo ''");
    if (tag.trim()) {
      return ok({ version: tag.trim().replace(/^v/, ""), source: "git-tag" });
    }

    return ok({ version: "0.0.0", source: "default" });
  },
};

/**
 * Calculate next version based on commits
 */
export const releaseNext: Cmd<{ since?: string }, { current: string; next: string; type: ReleaseType }> = {
  name: "release:next",
  description: "Calculate next version based on commits",
  schema: z.object({ since: z.string().optional() }),
  async exec({ since }, ctx) {
    const versionResult = await releaseVersion.exec({}, ctx);
    if (versionResult.code !== CODE.OK || !versionResult.data) {
      return err("release:version-failed");
    }

    const current = versionResult.data.version;
    const sinceRef = since || `v${current}`;

    // Get commits since last version
    const { stdout: log } = await ctx.exec(`git log ${sinceRef}..HEAD --oneline 2>/dev/null || git log --oneline -20`);
    const commits = parseCommits(log);

    // Determine release type
    let type: ReleaseType = "patch";
    if (commits.some(c => c.breaking)) {
      type = "major";
    } else if (commits.some(c => c.type === "feat")) {
      type = "minor";
    }

    const next = bumpVersion(current, type);

    return ok({ current, next, type });
  },
};

/**
 * Bump version
 */
export const releaseBump: Cmd<{ type: ReleaseType; preId?: string }, { version: string }> = {
  name: "release:bump",
  description: "Bump version in package.json",
  schema: z.object({
    type: z.enum(["major", "minor", "patch", "prerelease"]),
    preId: z.string().optional(),
  }),
  async exec({ type, preId }, ctx) {
    if (isDemo()) {
      return ok({ version: "0.0.1-demo" });
    }

    const versionResult = await releaseVersion.exec({}, ctx);
    if (versionResult.code !== CODE.OK || !versionResult.data) {
      return err("release:version-failed");
    }

    const current = versionResult.data.version;
    const next = bumpVersion(current, type, preId);

    // Update package.json
    const pkg = await ctx.read("package.json");
    if (pkg) {
      const parsed = JSON.parse(pkg);
      parsed.version = next;
      await ctx.write("package.json", JSON.stringify(parsed, null, 2) + "\n");
    }

    logAction(ctx, `release:bump:${current}→${next}`, CODE.OK);
    return ok({ version: next });
  },
};

// ============================================================================
// Changelog Commands
// ============================================================================

/**
 * Generate changelog entry
 */
export const releaseChangelog: Cmd<{ since?: string }, ChangelogEntry> = {
  name: "release:changelog",
  description: "Generate changelog entry from commits",
  schema: z.object({ since: z.string().optional() }),
  async exec({ since }, ctx) {
    const versionResult = await releaseVersion.exec({}, ctx);
    const nextResult = await releaseNext.exec({ since }, ctx);

    if (nextResult.code !== CODE.OK || !nextResult.data) {
      return err("release:next-failed");
    }

    const sinceRef = since || `v${versionResult.data?.version}`;
    const { stdout: log } = await ctx.exec(`git log ${sinceRef}..HEAD --oneline 2>/dev/null || git log --oneline -20`);
    const commits = parseCommits(log);

    const entry: ChangelogEntry = {
      version: nextResult.data.next,
      date: new Date().toISOString().split("T")[0],
      changes: {
        breaking: commits.filter(c => c.breaking).map(c => c.message),
        features: commits.filter(c => c.type === "feat").map(c => c.message),
        fixes: commits.filter(c => c.type === "fix").map(c => c.message),
        other: commits.filter(c => !["feat", "fix"].includes(c.type) && !c.breaking).map(c => c.message),
      },
    };

    return ok(entry);
  },
};

/**
 * Write changelog to file
 */
export const releaseWriteChangelog: Cmd<{ prepend?: boolean }, { path: string }> = {
  name: "release:write-changelog",
  description: "Write changelog entry to CHANGELOG.md",
  schema: z.object({ prepend: z.boolean().optional() }),
  async exec({ prepend = true }, ctx) {
    const entryResult = await releaseChangelog.exec({}, ctx);
    if (entryResult.code !== CODE.OK || !entryResult.data) {
      return err("release:changelog-failed");
    }

    const entry = entryResult.data;
    let md = `## [${entry.version}] - ${entry.date}\n\n`;

    if (entry.changes.breaking.length > 0) {
      md += "### ⚠️ Breaking Changes\n\n";
      for (const c of entry.changes.breaking) {
        md += `- ${c}\n`;
      }
      md += "\n";
    }

    if (entry.changes.features.length > 0) {
      md += "### ✨ Features\n\n";
      for (const c of entry.changes.features) {
        md += `- ${c}\n`;
      }
      md += "\n";
    }

    if (entry.changes.fixes.length > 0) {
      md += "### 🐛 Bug Fixes\n\n";
      for (const c of entry.changes.fixes) {
        md += `- ${c}\n`;
      }
      md += "\n";
    }

    if (entry.changes.other.length > 0) {
      md += "### 🔧 Other Changes\n\n";
      for (const c of entry.changes.other) {
        md += `- ${c}\n`;
      }
      md += "\n";
    }

    const path = "CHANGELOG.md";
    const existing = await ctx.read(path);

    if (prepend && existing) {
      const header = existing.match(/^# Changelog\n\n/)?.[0] || "# Changelog\n\n";
      const rest = existing.replace(/^# Changelog\n\n/, "");
      await ctx.write(path, header + md + rest);
    } else {
      await ctx.write(path, `# Changelog\n\n${md}`);
    }

    logAction(ctx, `release:changelog:${entry.version}`, CODE.OK);
    return ok({ path });
  },
};

// ============================================================================
// Release Commands
// ============================================================================

/**
 * Create release
 */
export const releaseCreate: Cmd<{ type?: ReleaseType; push?: boolean }, { version: string; tag: string }> = {
  name: "release:create",
  description: "Create a new release with version bump, changelog, and tag",
  schema: z.object({
    type: z.enum(["major", "minor", "patch", "prerelease"]).optional(),
    push: z.boolean().optional(),
  }),
  async exec({ type, push }, ctx) {
    // Safety check
    if (await isProtectedBranch(ctx)) {
      const branch = await getCurrentBranch(ctx);
      if (!isProd()) {
        return err(`release:protected-branch:${branch}`);
      }
    }

    // Determine version
    let releaseType = type;
    if (!releaseType) {
      const nextResult = await releaseNext.exec({}, ctx);
      releaseType = nextResult.data?.type || "patch";
    }

    // Bump version
    const bumpResult = await releaseBump.exec({ type: releaseType }, ctx);
    if (bumpResult.code !== CODE.OK || !bumpResult.data) {
      return err("release:bump-failed");
    }

    const version = bumpResult.data.version;
    const tag = `v${version}`;

    // Generate changelog
    await releaseWriteChangelog.exec({}, ctx);

    // Commit
    await ctx.exec("git add -A");
    await ctx.exec(`git commit -m "chore(release): ${version}"`);

    // Tag
    await ctx.exec(`git tag -a ${tag} -m "Release ${version}"`);

    // Push if requested
    if (push && !isDemo()) {
      await ctx.exec("git push && git push --tags");
    }

    ctx.log("info", `Release ${version} created`);
    logAction(ctx, `release:create:${version}`, CODE.OK);

    return ok({ version, tag });
  },
};

/**
 * List recent releases
 */
export const releaseList: Cmd<{ limit?: number }, { releases: Array<{ tag: string; date: string; message: string }> }> = {
  name: "release:list",
  description: "List recent releases",
  schema: z.object({ limit: z.number().optional() }),
  async exec({ limit = 10 }, ctx) {
    const { stdout } = await ctx.exec(`git tag -l --sort=-version:refname | head -${limit}`);
    const tags = stdout.split("\n").filter(Boolean);

    const releases = [];
    for (const tag of tags) {
      const { stdout: info } = await ctx.exec(`git log -1 --format="%ai|%s" ${tag} 2>/dev/null || echo ""`);
      const [date, message] = info.split("|");
      releases.push({
        tag,
        date: date?.split(" ")[0] || "",
        message: message?.trim() || "",
      });
    }

    return ok({ releases });
  },
};

/**
 * Generate release notes
 */
export const releaseNotes: Cmd<{ version?: string }, { notes: string }> = {
  name: "release:notes",
  description: "Generate release notes for version",
  schema: z.object({ version: z.string().optional() }),
  async exec({ version }, ctx) {
    const changelogResult = await releaseChangelog.exec({}, ctx);
    if (changelogResult.code !== CODE.OK || !changelogResult.data) {
      return err("release:changelog-failed");
    }

    const entry = changelogResult.data;
    const v = version || entry.version;

    let notes = `# Release ${v}\n\n`;
    notes += `**Release Date:** ${entry.date}\n\n`;

    if (entry.changes.breaking.length > 0) {
      notes += "## ⚠️ Breaking Changes\n\n";
      notes += "These changes may require updates to your code:\n\n";
      for (const c of entry.changes.breaking) {
        notes += `- ${c}\n`;
      }
      notes += "\n";
    }

    if (entry.changes.features.length > 0) {
      notes += "## ✨ New Features\n\n";
      for (const c of entry.changes.features) {
        notes += `- ${c}\n`;
      }
      notes += "\n";
    }

    if (entry.changes.fixes.length > 0) {
      notes += "## 🐛 Bug Fixes\n\n";
      for (const c of entry.changes.fixes) {
        notes += `- ${c}\n`;
      }
      notes += "\n";
    }

    notes += "---\n\n";
    notes += `Full changelog: [CHANGELOG.md](./CHANGELOG.md)\n`;

    return ok({ notes });
  },
};

// ============================================================================
// Helpers
// ============================================================================

function parseCommits(log: string): ParsedCommit[] {
  const commits: ParsedCommit[] = [];
  const lines = log.split("\n").filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^([a-f0-9]+)\s+(?:(\w+)(?:\(([^)]+)\))?:\s*)?(.+)$/);
    if (!match) continue;

    const [, hash, type, scope, message] = match;
    const breaking = message.includes("BREAKING") || message.startsWith("!");

    commits.push({
      hash,
      type: (type as CommitType) || "chore",
      scope,
      message,
      breaking,
    });
  }

  return commits;
}

function bumpVersion(version: string, type: ReleaseType, preId?: string): string {
  const [major, minor, patch] = version.replace(/-.+$/, "").split(".").map(Number);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    case "prerelease":
      return `${major}.${minor}.${patch + 1}-${preId || "alpha"}.1`;
    default:
      return version;
  }
}

export const releaseCmds = [
  releaseVersion, releaseNext, releaseBump,
  releaseChangelog, releaseWriteChangelog,
  releaseCreate, releaseList, releaseNotes,
];
