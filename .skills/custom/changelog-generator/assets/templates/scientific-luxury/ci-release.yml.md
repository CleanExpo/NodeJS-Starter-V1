# GitHub Actions Release Workflow - Scientific Luxury

Tag-triggered release workflow for NodeJS-Starter-V1 projects using the Scientific Luxury design system.

---

## Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for changelog extraction

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run quality checks
        run: |
          pnpm turbo run type-check
          pnpm turbo run lint
          pnpm turbo run test

      - name: Extract release notes from CHANGELOG.md
        id: changelog
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          echo "version=${VERSION}" >> $GITHUB_OUTPUT

          # Extract the section for this version
          NOTES=$(sed -n "/## \[${VERSION}\]/,/## \[/p" CHANGELOG.md | head -n -1)

          # If no section found, generate from git log
          if [ -z "$NOTES" ]; then
            PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
            if [ -n "$PREVIOUS_TAG" ]; then
              NOTES=$(git log ${PREVIOUS_TAG}..HEAD --pretty=format:"- %s (%h)" --no-merges)
            else
              NOTES="Initial release"
            fi
          fi

          echo "notes<<EOF" >> $GITHUB_OUTPUT
          echo "$NOTES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          name: "v${{ steps.changelog.outputs.version }}"
          body: ${{ steps.changelog.outputs.notes }}
          generate_release_notes: false
          draft: false
          prerelease: ${{ contains(github.ref, '-alpha') || contains(github.ref, '-beta') || contains(github.ref, '-rc') }}
```

---

## How It Works

1. Developer runs `pnpm run release` locally (bumps version, updates CHANGELOG.md, creates tag)
2. Developer pushes with `git push --follow-tags origin main`
3. Tag push triggers this workflow
4. Workflow runs quality checks (type-check, lint, test)
5. Workflow extracts release notes from CHANGELOG.md for the tagged version
6. GitHub Release is created with the extracted notes
7. Pre-release versions (alpha, beta, rc) are marked as pre-release automatically

---

## Prerequisites

- `standard-version` installed as a dev dependency
- `.versionrc.json` configured (see `versionrc.json.md` template)
- `release` scripts in root `package.json`
- CHANGELOG.md follows Keep a Changelog format
- Full git history available (`fetch-depth: 0`)

---

## Complementary Workflows

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| `ci.yml` | Test on every push/PR | `push`, `pull_request` |
| `security.yml` | Dependency audit | Schedule or `push` |
| `release.yml` (this) | Create GitHub Release | Tag `v*` push |
