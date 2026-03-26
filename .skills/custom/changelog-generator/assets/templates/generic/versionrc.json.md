# .versionrc.json Configuration - Generic

Generic `standard-version` configuration template adaptable to any project.

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
  "commitUrlFormat": "https://github.com/{owner}/{repo}/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/{owner}/{repo}/compare/{{previousTag}}...{{currentTag}}",
  "releaseCommitMessageFormat": "chore(release): {{currentTag}}"
}
```

---

## Customisation Points

| Field | Purpose | Adapt For |
|-------|---------|----------|
| `types` | Commit type to section mapping | Add or remove types for your workflow |
| `types[].hidden` | Exclude from changelog | Set `true` for internal-only types |
| `commitUrlFormat` | Link to individual commits | Replace `{owner}/{repo}` with your values |
| `compareUrlFormat` | Link to version diffs | Replace `{owner}/{repo}` with your values |
| `releaseCommitMessageFormat` | Release commit message | Customise prefix or format |

---

## Package.json Scripts

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

---

## Installation

```bash
# npm
npm install --save-dev standard-version

# pnpm (monorepo)
pnpm add -D standard-version -w

# yarn
yarn add -D standard-version
```

---

## Usage

```bash
# Preview changes
npx standard-version --dry-run

# Execute release
npx standard-version

# Push with tags
git push --follow-tags origin main
```
