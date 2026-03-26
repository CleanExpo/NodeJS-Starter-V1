# /lib sync — Sync Library Updates

Pull the latest library assets from the remote source and update local indices.

## Usage

```
/lib sync [--dry-run] [--force]
```

## What It Does

1. Check git state is clean (warn if dirty)
2. Verify library version compatibility
3. Pull latest via `git submodule update --remote`
4. Validate registry schemas
5. Regenerate local skill loader cache
6. Report any breaking changes

## Examples

```bash
/lib sync              # Standard sync
/lib sync --dry-run    # Preview changes without applying
/lib sync --force      # Override version compatibility check
```

## Script

Runs: `scripts/solution-library/sync-library.ps1`

## Output Format

```
LIBRARY SYNC
═══════════════════════════════════════════════
Previous version: 1.0.0
Latest version:   1.1.0

Changes:
  + skill: data-pipeline       NEW
  + skill: vector-search       NEW
  ~ skill: rate-limiter        UPDATED (v1.0 → v1.1)
  - skill: old-cache           DEPRECATED (use: cache-strategy)

Validation: ✓ PASS
Registry:   ✓ 67 skills, 31 agents, 8 workflows

Applied 3 additions, 1 update, 0 breaking changes.
═══════════════════════════════════════════════
Sync complete. Run /lib list to see all assets.
```

## Breaking Changes

If a breaking change is detected:

1. Sync is paused
2. Breaking change is reported
3. Migration guide is shown
4. User must confirm to proceed with `--force`

## For Submodule Users

If using as a git submodule:

```bash
git submodule update --remote lib/solution-library
```

The `/lib sync` command wraps this with validation.
