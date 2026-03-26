# Changelog Generator - Before/After Examples

Demonstrates the difference between manual changelog maintenance and automated conventional commit generation.

---

## Example 1: Manual vs Automated CHANGELOG.md

### BEFORE (Manual)

```markdown
# Changelog

## v1.2 - March 2026

- Added some new features
- Fixed a bunch of bugs
- Updated the UI
- Refactored the backend
- Changed the auth flow (might break some things?)
```

**Problems**:
- Version not semver-compliant (v1.2 instead of v1.2.0)
- Date format inconsistent (not DD/MM/YYYY)
- Entries are vague — "some new features", "a bunch of bugs"
- No scope — which part of the system was affected?
- No commit links — cannot trace entries to source
- Breaking change buried and uncertain ("might break some things?")
- Internal changes (refactoring) included in user-facing changelog
- No comparison URLs at the bottom

### AFTER (Automated)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 26/03/2026

### Breaking Changes

- **backend**: Remove deprecated /api/v1/contractors endpoint ([abc1234])

### Features

- **web**: Add dark mode toggle with system preference detection ([def5678])
- **web**: Add contractor availability calendar view ([ghi9012])
- **backend**: Add rate limiting middleware for auth endpoints ([jkl3456])

### Bug Fixes

- **backend**: Resolve JWT token refresh returning 401 on valid tokens ([mno7890])
- **web**: Fix dashboard chart rendering on mobile viewports ([pqr1234])

### Performance

- **backend**: Optimise contractor search query with composite index ([stu5678])

[Unreleased]: https://github.com/CleanExpo/NodeJS-Starter-V1/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/CleanExpo/NodeJS-Starter-V1/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/CleanExpo/NodeJS-Starter-V1/releases/tag/v1.0.0
```

**Improvements**:
- Semantic version: `2.0.0` (major bump due to breaking change)
- Date in DD/MM/YYYY (en-AU locale)
- Entries grouped by type: Breaking Changes > Features > Bug Fixes > Performance
- Every entry has a scope (**web**, **backend**) and commit hash link
- Breaking change prominently displayed at the top
- Internal changes (refactor, test, chore) excluded — user-facing only
- Comparison URLs at the bottom for full diffs

---

## Example 2: Release Workflow

### BEFORE (Manual Release)

```bash
# Developer manually decides version
git tag v1.3.0
git push --tags

# Separately writes release notes on GitHub
# Forgets to update CHANGELOG.md
# CHANGELOG.md drifts from actual releases
```

**Problems**:
- Version not derived from commit types
- CHANGELOG.md not updated
- Release notes written manually, may miss changes
- No verification that version matches change impact

### AFTER (Automated Release)

```bash
# Step 1: Preview the release
$ pnpm run release:dry-run

> standard-version --dry-run

✔ bumping version in package.json from 1.0.0 to 1.1.0
✔ outputting changes to CHANGELOG.md

---
## [1.1.0] - 26/03/2026

### Features

- **web**: Add dark mode toggle ([def5678])
- **backend**: Add rate limiting middleware ([jkl3456])

### Bug Fixes

- **backend**: Resolve JWT token refresh issue ([mno7890])
---

# Step 2: Execute the release
$ pnpm run release

✔ bumping version in package.json from 1.0.0 to 1.1.0
✔ outputting changes to CHANGELOG.md
✔ committing package.json and CHANGELOG.md
✔ tagging release v1.1.0

# Step 3: Push (triggers CI release workflow)
$ git push --follow-tags origin main

# CI automatically creates GitHub Release with changelog excerpt
```

**Improvements**:
- Version bump derived from commits: `feat` = minor, no breaking changes
- CHANGELOG.md updated automatically in the same commit
- Dry-run allows preview before committing
- Single `git push` triggers CI to create GitHub Release
- Release notes extracted from CHANGELOG.md — single source of truth

---

## Example 3: Breaking Change Handling

### BEFORE (Manual)

```markdown
## v1.3.0

- Changed the auth API (breaking)
```

Version incorrectly bumped as minor despite breaking change.

### AFTER (Automated)

Commit:
```
feat(backend)!: switch authentication to OAuth2

BREAKING CHANGE: Password-based login endpoint /api/auth/login has been removed.
All clients must migrate to /api/auth/oauth2/callback.
```

Generated:
```markdown
## [2.0.0] - 26/03/2026

### Breaking Changes

- **backend**: Switch authentication to OAuth2 ([xyz7890])

  Password-based login endpoint /api/auth/login has been removed.
  All clients must migrate to /api/auth/oauth2/callback.
```

Version correctly bumped to **major** (2.0.0) due to `BREAKING CHANGE` footer. The breaking change description is included in the changelog entry.

---

## Example 4: Monorepo Scope Grouping

### BEFORE

```markdown
## Changes
- dark mode
- rate limiting
- fixed a test
- new skill
```

### AFTER

```markdown
## [1.1.0] - 26/03/2026

### Features

- **web**: Add dark mode toggle with system preference detection ([abc1234])
- **backend**: Add rate limiting middleware for auth endpoints ([def5678])
- **skills**: Generate queue-worker skill via Skill Manager ([ghi9012])
```

Scopes from Conventional Commits (`web`, `backend`, `skills`) naturally group entries by package in the monorepo. Internal changes (`test`) are excluded.
