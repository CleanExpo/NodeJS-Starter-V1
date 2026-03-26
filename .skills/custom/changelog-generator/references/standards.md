# Changelog Generator - Standards Reference

Commit type to section mapping, date formatting, Keep a Changelog format, and version bump rules.

---

## Commit Type to Section Mapping

| Commit Type | Changelog Section | Version Bump | Included in Changelog |
|-------------|------------------|:------------:|:---------------------:|
| `feat` | Features | minor | Always |
| `fix` | Bug Fixes | patch | Always |
| `perf` | Performance | patch | Always |
| `BREAKING CHANGE` | Breaking Changes | **major** | Always |
| `docs` | Documentation | none | Optional (hidden by default) |
| `refactor` | — | none | Never |
| `test` | — | none | Never |
| `chore` | — | none | Never |
| `ci` | — | none | Never |
| `style` | — | none | Never |
| `build` | — | none | Never |

### Section Display Order

Sections appear in this order (empty sections omitted):

1. **Breaking Changes** (highest impact first)
2. **Features**
3. **Bug Fixes**
4. **Performance**
5. **Documentation** (if not hidden)

---

## Breaking Change Detection

Three detection mechanisms:

1. **Footer keyword**: `BREAKING CHANGE:` in commit body or footer
   ```
   feat(auth): switch to OAuth2

   BREAKING CHANGE: Password-based login is removed. All users must use OAuth2.
   ```

2. **Bang notation**: `!` after type/scope
   ```
   feat(auth)!: remove password login
   ```

3. **Explicit type**: `BREAKING CHANGE` as the commit type (non-standard, detected for safety)

**Rule**: Any breaking change indicator triggers a **major** version bump, regardless of the commit type prefix (`feat`, `fix`, etc.).

---

## Version Bump Decision Tree

```
Has BREAKING CHANGE? ──yes──> Major (X.0.0)
        │
       no
        │
Has feat commits? ──yes──> Minor (0.X.0)
        │
       no
        │
Has fix/perf commits? ──yes──> Patch (0.0.X)
        │
       no
        │
No version bump needed (no releasable commits)
```

---

## Date Format Standard

| Context | Format | Example |
|---------|--------|---------|
| CHANGELOG.md entries | DD/MM/YYYY | 26/03/2026 |
| Git tags | ISO (implicit) | `v1.2.0` (date in commit, not tag) |
| Release notes | DD/MM/YYYY HH:mm AEST | 26/03/2026 14:30 AEST |

**Locale**: en-AU. Month names (if used): January, February, March, etc. (not abbreviated).

---

## Keep a Changelog Format

The project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) with en-AU date localisation.

### File Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Features

- **scope**: Description ([hash])

## [X.Y.Z] - DD/MM/YYYY

### Breaking Changes

- **scope**: Description ([hash])

### Features

- **scope**: Description ([hash])

### Bug Fixes

- **scope**: Description ([hash])

### Performance

- **scope**: Description ([hash])

[Unreleased]: https://github.com/{owner}/{repo}/compare/vX.Y.Z...HEAD
[X.Y.Z]: https://github.com/{owner}/{repo}/compare/vA.B.C...vX.Y.Z
[A.B.C]: https://github.com/{owner}/{repo}/releases/tag/vA.B.C
```

### Entry Format

```
- **{scope}**: {description} ([{short_hash}])
```

| Element | Rule |
|---------|------|
| Scope | Bold, from commit `(scope)` |
| Description | Sentence case, no trailing period |
| Hash | 7-character short hash in parentheses, linking to commit |
| No scope | Omit bold: `- Description ([hash])` |

---

## .versionrc.json Configuration

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
  "compareUrlFormat": "https://github.com/CleanExpo/NodeJS-Starter-V1/compare/{{previousTag}}...{{currentTag}}"
}
```

---

## Monorepo Grouping Standard

For monorepo projects (like NodeJS-Starter-V1 with Turborepo), use scope-based grouping in a single root-level CHANGELOG.md:

```markdown
### Features

- **web**: Add dark mode toggle ([abc1234])
- **backend**: Add rate limiting middleware ([def5678])
- **skills**: Generate retry-strategy skill ([356b5ce])
```

The `(scope)` from Conventional Commits naturally groups entries by package. No per-package changelogs needed unless packages are published independently.

---

## Release Scripts

```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:dry-run": "standard-version --dry-run"
  }
}
```

### Release Process

1. `pnpm run release:dry-run` — Preview version bump and changelog
2. `pnpm run release` — Bump version, update CHANGELOG.md, create commit and tag
3. `git push --follow-tags origin main` — Push commit and tag to trigger CI

---

## CI Integration Standard

Tag-triggered workflow creates a GitHub Release with changelog excerpt:

```yaml
on:
  push:
    tags:
      - "v*"

steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0  # Full history required

  - name: Extract release notes
    run: |
      VERSION=${GITHUB_REF#refs/tags/v}
      sed -n "/## \[${VERSION}\]/,/## \[/p" CHANGELOG.md | head -n -1

  - name: Create GitHub Release
    uses: softprops/action-gh-release@v2
    with:
      body: ${{ steps.changelog.outputs.notes }}
```
