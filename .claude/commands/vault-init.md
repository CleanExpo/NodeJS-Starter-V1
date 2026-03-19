---
id: vault-init
type: command
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
tags: [vault, setup, adoption]
invocation: /vault-init
arguments:
  - name: mode
    type: string
    required: false
    description: 'Installation mode: full (default), minimal, or validate'
effort: medium
---

# /vault-init — Vault System Initialisation

Initialises the Obsidian-style vault system for a project.

## Usage

```bash
/vault-init              # Full setup with hooks, MCP config, and indexes
/vault-init --minimal    # Just frontmatter schema and index structure
/vault-init --validate   # Validate existing vault without changes
```

## What It Does

### Full Mode (Default)

1. **Schema Installation**
   - Copies `.claude/schemas/frontmatter-schema.yaml` if missing
   - Validates existing schema version

2. **Frontmatter Adoption**
   - Runs `scripts/adopt-vault.mjs` on all .md files
   - Adds missing frontmatter while preserving existing fields
   - Sets `created` and `modified` dates

3. **Index Generation**
   - Creates `.claude/VAULT-INDEX.md` (master lookup)
   - Creates per-folder `index.md` files (agents, skills, rules, etc.)

4. **Hook Installation**
   - Adds `PostCompact` hook for vault state preservation
   - Adds `PostToolUse` hook for frontmatter date updates

5. **MCP Configuration**
   - Creates `.claude/mcp/obsidian.json` for semantic search
   - Configures wiki-link resolution

### Minimal Mode

- Schema + indexes only
- No hooks or MCP config
- Good for quick adoption or testing

### Validate Mode

- Runs `scripts/vault-validate.mjs`
- Reports broken wiki-links, missing frontmatter, duplicate IDs
- Non-destructive — no files modified

## Prerequisites

- Node.js 20+
- pnpm installed

## Commands After Initialisation

```bash
pnpm vault:index      # Regenerate all indexes
pnpm vault:validate   # Check for broken links
pnpm vault:adopt      # Add frontmatter to new files
```

## Wiki-Link Syntax

After initialisation, these link patterns are available:

| Pattern           | Example                                 | Resolution               |
| ----------------- | --------------------------------------- | ------------------------ |
| `[[id]]`          | `[[scientific-luxury]]`                 | Lookup in VAULT-INDEX.md |
| `[[type/id]]`     | `[[agent/frontend-specialist]]`         | Direct path by type      |
| `[[id#section]]`  | `[[scientific-luxury#banned-elements]]` | Anchor link              |
| `[[id\|display]]` | `[[scientific-luxury\|Design System]]`  | Custom text              |

## Example Output

```
Vault Initialisation — NodeJS-Starter-V1
═══════════════════════════════════════════════════

[1/5] Checking schema...
      ✓ Schema already installed

[2/5] Adopting frontmatter...
      ✓ 23 agents updated
      ✓ 70 skills updated
      ✓ 7 rules updated

[3/5] Generating indexes...
      ✓ VAULT-INDEX.md (100 entries)
      ✓ agents/index.md
      ✓ skills/index.md
      ✓ rules/index.md

[4/5] Installing hooks...
      ✓ PostCompact hook configured
      ✓ PostToolUse hook configured

[5/5] MCP configuration...
      ✓ obsidian.json created

═══════════════════════════════════════════════════
Vault initialisation complete!
Run 'pnpm vault:validate' to check for issues.
```

## Troubleshooting

### "Duplicate ID" Errors

Multiple files have the same `id` in frontmatter. Fix by:

1. Making IDs unique
2. Using the `aliases` field for alternative names

### "Broken wiki-link" Errors

A `[[link]]` points to a non-existent ID. Fix by:

1. Creating the missing file
2. Adding the target as an alias
3. Correcting the link target

### Hook Not Firing

Check `settings.json` has the hook configured:

```json
{
  "hooks": {
    "PostCompact": [".claude/hooks/scripts/post-compact-vault.ps1"]
  }
}
```
