# Changelog Generator - Anti-Patterns Reference

Banned patterns in changelog generation. These anti-patterns cause drift between git history and documented changes.

---

## Anti-Pattern 1: Manual Changelog Updates

**Banned**: Editing CHANGELOG.md by hand instead of generating it from Conventional Commits.

### What It Looks Like

```markdown
## [1.2.0] - 26/03/2026

### Features

- Added dark mode (I think this was in the last few commits)
- Some API improvements
```

### Why It Is Banned

- Entries drift from actual git history
- Human memory is unreliable — features are missed or misattributed
- No link to source commits or PRs
- Version numbers may not match actual semantic impact
- Two developers may write different entries for the same change

### Correct Approach

```bash
# Generate from git history automatically
pnpm run release
# or
pnpm dlx conventional-changelog -p angular -i CHANGELOG.md -s
```

Every entry links to its commit hash. Version bumps are determined by commit types, not human judgment.

---

## Anti-Pattern 2: Unstructured Entries

**Banned**: Writing changelog entries without consistent formatting, grouping, or linking.

### What It Looks Like

```markdown
## Changes

- fixed a bug with login
- new dashboard page
- Updated dependencies
- refactored the auth module
- BREAKING: removed the old API endpoint
```

### Why It Is Banned

- No grouping by type (features, fixes, breaking changes)
- No scope information — which part of the system was affected?
- No commit hash links — cannot trace entry to source
- Breaking changes buried in a list rather than prominently displayed
- Inconsistent capitalisation and formatting

### Correct Approach

```markdown
## [1.2.0] - 26/03/2026

### Breaking Changes

- **api**: Remove deprecated /api/v1/contractors endpoint ([abc1234])

### Features

- **web**: Add dashboard page with real-time metrics ([def5678])

### Bug Fixes

- **backend**: Resolve login timeout on expired JWT tokens ([ghi9012])
```

Sections ordered by impact: Breaking Changes > Features > Bug Fixes > Performance.

---

## Anti-Pattern 3: Version Guessing

**Banned**: Manually deciding version numbers instead of deriving them from commit types.

### What It Looks Like

```bash
# Developer decides it "feels like" a minor version bump
git tag v1.3.0
```

### Why It Is Banned

- A `feat` commit without a `BREAKING CHANGE` should be minor, not major
- A `fix`-only release should be patch, not minor
- Human judgement is inconsistent across developers
- Semantic versioning contract is broken for consumers

### Correct Approach

Use the version bump decision tree:

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
No version bump needed
```

`standard-version` and `conventional-changelog` implement this automatically.

---

## Anti-Pattern 4: Including Non-User-Facing Changes

**Banned**: Polluting the changelog with internal changes that do not affect users.

### What It Looks Like

```markdown
## [1.2.0] - 26/03/2026

### Features
- **web**: Add dark mode toggle ([abc1234])

### Chores
- Updated ESLint config
- Fixed CI pipeline timeout
- Renamed internal test utilities
- Bumped dev dependency versions

### Tests
- Added unit tests for auth module
- Fixed flaky integration test
```

### Why It Is Banned

- Chores, CI, and test changes are not user-facing
- Noise drowns out meaningful changes
- Users do not care about internal tooling

### Correct Approach

Configure `.versionrc.json` to hide non-user-facing types:

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
  ]
}
```

---

## Anti-Pattern 5: US Date Format

**Banned**: Using MM/DD/YYYY format in changelogs instead of DD/MM/YYYY (en-AU).

### What It Looks Like

```markdown
## [1.2.0] - 03/26/2026
```

### Why It Is Banned

- Inconsistent with project locale (en-AU)
- Ambiguous — is `03/04/2026` March 4th or April 3rd?
- Breaks consistency with the rest of the project documentation

### Correct Approach

```markdown
## [1.2.0] - 26/03/2026
```

Always DD/MM/YYYY. The `standard-version` date format can be configured, or post-process with a script.

---

## Anti-Pattern 6: Changelog Without Diff Links

**Banned**: Releasing without comparison URLs at the bottom of CHANGELOG.md.

### What It Looks Like

```markdown
## [1.2.0] - 26/03/2026

### Features
- Added dark mode

## [1.1.0] - 20/03/2026

### Bug Fixes
- Fixed login issue
```

### Why It Is Banned

- No way to see the full diff between versions
- No link to the `[Unreleased]` comparison for upcoming changes
- Consumers cannot review what changed at the code level

### Correct Approach

```markdown
[Unreleased]: https://github.com/CleanExpo/NodeJS-Starter-V1/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/CleanExpo/NodeJS-Starter-V1/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/CleanExpo/NodeJS-Starter-V1/releases/tag/v1.1.0
```

Configure in `.versionrc.json`:

```json
{
  "commitUrlFormat": "https://github.com/CleanExpo/NodeJS-Starter-V1/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/CleanExpo/NodeJS-Starter-V1/compare/{{previousTag}}...{{currentTag}}"
}
```

---

## Anti-Pattern 7: Shallow Clone in CI

**Banned**: Using `fetch-depth: 1` (the default) in GitHub Actions checkout when generating changelogs.

### What It Looks Like

```yaml
- uses: actions/checkout@v4
  # No fetch-depth specified — defaults to 1
```

### Why It Is Banned

- Only the latest commit is available
- Changelog generation cannot read commits since last tag
- Produces empty or incomplete changelogs

### Correct Approach

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Full history for changelog generation
```
