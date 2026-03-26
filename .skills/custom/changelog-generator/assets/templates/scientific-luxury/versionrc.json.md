# .versionrc.json Configuration - Scientific Luxury

Configuration for `standard-version` in Scientific Luxury projects using the NodeJS-Starter-V1 framework.

---

## Configuration

```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance" },
    { "type": "docs", "section": "Documentation", "hidden": true },
    { "type": "refactor", "hidden": true },
    { "type": "test", "hidden": true },
    { "type": "chore", "hidden": true },
    { "type": "ci", "hidden": true },
    { "type": "style", "hidden": true },
    { "type": "build", "hidden": true }
  ],
  "commitUrlFormat": "https://github.com/CleanExpo/NodeJS-Starter-V1/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/CleanExpo/NodeJS-Starter-V1/compare/{{previousTag}}...{{currentTag}}",
  "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n",
  "releaseCommitMessageFormat": "chore(release): {{currentTag}}"
}
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:patch": "standard-version --release-as patch",
    "release:dry-run": "standard-version --dry-run",
    "release:first": "standard-version --first-release"
  }
}
```

---

## Installation

```bash
pnpm add -D standard-version -w
```

---

## Usage

```bash
# Preview what will happen (no changes made)
pnpm run release:dry-run

# Execute release (bumps version, updates CHANGELOG.md, creates commit + tag)
pnpm run release

# Force a specific bump type
pnpm run release:minor
pnpm run release:major

# First release (creates v1.0.0 without comparing to previous tag)
pnpm run release:first

# Push commit and tag to trigger CI release workflow
git push --follow-tags origin main
```

---

## Scope Conventions (NodeJS-Starter-V1)

| Scope | Package | Examples |
|-------|---------|---------|
| `web` | `apps/web/` | Frontend components, pages, hooks |
| `backend` | `apps/backend/` | API routes, agents, database models |
| `skills` | `.skills/` | Skill creation, updates, references |
| `agents` | `.claude/agents/` | Agent definitions, commands |
| `hooks` | `.claude/hooks/` | Pre/post tool hooks |
| `docs` | `docs/` | Documentation updates |
| `infra` | Root config, Docker, CI | Infrastructure and tooling |

---

## Date Localisation Note

`standard-version` outputs dates in ISO format (YYYY-MM-DD) by default. For en-AU compliance (DD/MM/YYYY), use a post-processing script or configure a custom date format if supported by your version of `standard-version`.

```bash
# Post-process: convert ISO dates to DD/MM/YYYY
sed -i 's/\([0-9]\{4\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)/\3\/\2\/\1/g' CHANGELOG.md
```
