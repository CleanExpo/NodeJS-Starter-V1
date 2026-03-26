# GitHub Actions Release Workflow - Generic

Generic tag-triggered release workflow adaptable to any project.

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

      - name: Extract release notes from CHANGELOG.md
        id: changelog
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          echo "version=${VERSION}" >> $GITHUB_OUTPUT

          # Extract the section for this version
          NOTES=$(sed -n "/## \[${VERSION}\]/,/## \[/p" CHANGELOG.md | head -n -1)

          # Fallback: generate from git log if no CHANGELOG section found
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

1. A version tag (`v*`) is pushed to the repository
2. The workflow checks out the full git history
3. Release notes are extracted from CHANGELOG.md for the tagged version
4. If no CHANGELOG section exists, notes are generated from git log
5. A GitHub Release is created with the extracted notes
6. Pre-release tags (alpha, beta, rc) are automatically marked as pre-release

---

## Customisation Points

| What | How |
|------|-----|
| Add quality checks | Insert test/lint steps before release notes extraction |
| Add build artifacts | Use `files` parameter in `softprops/action-gh-release` |
| Publish to npm | Add `npm publish` step after release creation |
| Publish to PyPI | Add `twine upload` step after release creation |
| Notify team | Add Slack/Discord notification step at the end |

---

## Adding Quality Checks (Optional)

```yaml
      # Insert before "Extract release notes" step
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install and test
        run: |
          npm ci
          npm test
          npm run lint
```

---

## Adding Build Artifacts (Optional)

```yaml
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          name: "v${{ steps.changelog.outputs.version }}"
          body: ${{ steps.changelog.outputs.notes }}
          files: |
            dist/*.tar.gz
            dist/*.zip
```

---

## Prerequisites

- CHANGELOG.md follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
- Version sections formatted as `## [X.Y.Z] - DATE`
- Full git history available (the `fetch-depth: 0` in checkout handles this)
- Repository has `contents: write` permission for the workflow
