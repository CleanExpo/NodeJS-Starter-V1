# Changelog Generator - Generic Standards

Generic changelog generation patterns applicable to any project using Conventional Commits and semantic versioning.

---

## Universal Changelog Principles

1. **Generated, not written**: Changelogs are derived from structured commit messages, never authored manually
2. **User-facing only**: Internal changes (chores, CI, tests) are excluded from public changelogs
3. **Linked to source**: Every entry references its commit or pull request
4. **Versioned semantically**: Version numbers reflect the impact of changes (major/minor/patch)

---

## Generic Commit Convention

Any project using Conventional Commits follows this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Type Categories

| Category | Types | User-Facing |
|----------|-------|:-----------:|
| **Features** | `feat` | Yes |
| **Fixes** | `fix` | Yes |
| **Performance** | `perf` | Yes |
| **Breaking** | Any type with `BREAKING CHANGE` footer or `!` | Yes |
| **Internal** | `docs`, `refactor`, `test`, `chore`, `ci`, `style`, `build` | No |

---

## Generic Tooling Options

### Option A: standard-version (Node.js)

```bash
npm install --save-dev standard-version
# or
pnpm add -D standard-version -w
```

Best for: Node.js projects, monorepos with pnpm/npm.

### Option B: conventional-changelog CLI

```bash
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

Best for: One-off generation, CI scripts, non-Node projects.

### Option C: git-cliff (Rust)

```bash
cargo install git-cliff
git-cliff --output CHANGELOG.md
```

Best for: Rust projects, multi-language repos, advanced customisation.

### Option D: release-please (Google)

GitHub Action that creates release PRs automatically.

Best for: Fully automated releases, GitHub-native workflows.

---

## Generic .versionrc.json

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
    { "type": "ci", "hidden": true }
  ],
  "commitUrlFormat": "https://github.com/{owner}/{repo}/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/{owner}/{repo}/compare/{{previousTag}}...{{currentTag}}"
}
```

Replace `{owner}` and `{repo}` with your GitHub organisation and repository name.

---

## Generic CI Workflow

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Extract release notes
        id: changelog
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          NOTES=$(sed -n "/## \[${VERSION}\]/,/## \[/p" CHANGELOG.md | head -n -1)
          echo "notes<<EOF" >> $GITHUB_OUTPUT
          echo "$NOTES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body: ${{ steps.changelog.outputs.notes }}
          generate_release_notes: false
```

---

## Generic Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD

### Breaking Changes

- Description ([hash])

### Features

- Description ([hash])

### Bug Fixes

- Description ([hash])

[Unreleased]: https://github.com/{owner}/{repo}/compare/vX.Y.Z...HEAD
[X.Y.Z]: https://github.com/{owner}/{repo}/releases/tag/vX.Y.Z
```

**Note**: The generic format uses ISO date (YYYY-MM-DD) by default. Projects with locale requirements (e.g., en-AU: DD/MM/YYYY) should override the date format.

---

## Monorepo vs Single-Package

| Approach | When to Use | Implementation |
|----------|-------------|---------------|
| **Unified changelog** | Packages not published independently | Single root CHANGELOG.md with scope grouping |
| **Per-package changelogs** | Packages published to npm/PyPI/crates | One CHANGELOG.md per package directory |
| **Hybrid** | Some packages independent, some coupled | Root changelog for app, per-package for libraries |

---

## Semantic Versioning Summary

| Version Part | When to Bump | Signal |
|-------------|-------------|--------|
| **Major** (X.0.0) | Breaking changes | `BREAKING CHANGE` footer or `!` after type |
| **Minor** (0.X.0) | New features | `feat` commit type |
| **Patch** (0.0.X) | Bug fixes, performance | `fix` or `perf` commit type |
| **None** | Internal only | `docs`, `chore`, `ci`, `test`, `refactor` |

Pre-release versions: `1.0.0-alpha.1`, `1.0.0-beta.1`, `1.0.0-rc.1`
