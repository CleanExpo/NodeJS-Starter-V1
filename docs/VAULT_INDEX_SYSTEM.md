---
id: vault-index-system
type: doc
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
tags: [vault, index, wiki-links, obsidian, documentation]
---

# Vault Index System

> Transform your .md ecosystem into an Obsidian-compatible vault with wiki-style linking, O(1) lookup, and semantic search.

## Overview

The Vault Index System provides:

- **Bidirectional linking** via `[[wiki-link]]` syntax
- **Centralised index** at `.claude/VAULT-INDEX.md` for O(1) lookup
- **Per-folder indexes** for agents, skills, rules, blueprints, commands
- **MCP integration** for semantic search (optional)
- **Auto-maintenance hooks** to keep indexes current
- **Downstream adoption** for projects using this framework

## Quick Start

```bash
# Full initialisation
/vault-init

# Or manual steps:
pnpm vault:adopt          # Add frontmatter to all .md files
pnpm vault:index          # Generate indexes
pnpm vault:validate       # Check for issues
```

---

## Frontmatter Schema

All .md files in the vault should include frontmatter. The schema is defined in `.claude/schemas/frontmatter-schema.yaml`.

### Common Fields (Required)

```yaml
---
id: unique-kebab-case-id # Unique identifier for wiki-links
type: agent|skill|rule|hook|blueprint|primer|memory|command|doc
version: 1.0.0 # SemVer
created: 20/03/2026 # DD/MM/YYYY (en-AU)
modified: 20/03/2026 # Auto-updated by hook
status: active|deprecated|draft
---
```

### Optional Common Fields

```yaml
aliases: [alt-name-1, alt-name-2] # Alternative names for wiki-link resolution
tags: [tag1, tag2] # For filtering and queries
links:
  depends_on: [other-skill] # Hard dependencies
  extends: [base-agent] # Inheritance
  see_also: [related-doc] # Related reading
```

### Type-Specific Fields

| Type        | Additional Fields                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `agent`     | `role`, `priority`, `toolshed`, `context_scope[]`, `token_budget`, `skills_required[]`, `inherits_from` |
| `skill`     | `category`, `complexity`, `complements[]`, `triggers[]`, `effort`                                       |
| `rule`      | `authority`, `scope`, `overrides[]`                                                                     |
| `hook`      | `event_type`, `script_path`, `blocking`                                                                 |
| `blueprint` | `triggers[]`, `toolshed`, `iteration_caps{}`                                                            |
| `command`   | `invocation`, `arguments[]`, `effort`                                                                   |

---

## Wiki-Link Syntax

### Basic Patterns

| Pattern           | Example                                 | Resolution                            |
| ----------------- | --------------------------------------- | ------------------------------------- |
| `[[id]]`          | `[[scientific-luxury]]`                 | Search VAULT-INDEX.md for matching ID |
| `[[type/id]]`     | `[[agent/frontend-specialist]]`         | Direct path by type                   |
| `[[id#section]]`  | `[[scientific-luxury#banned-elements]]` | Link to heading anchor                |
| `[[id\|display]]` | `[[scientific-luxury\|Design System]]`  | Custom display text                   |

### Resolution Order

1. Search `id` field in VAULT-INDEX.md
2. Search `aliases` array in VAULT-INDEX.md
3. Report as broken link if not found

### Examples

```markdown
# In a document

The [[frontend-specialist]] agent uses the [[scientific-luxury]] design system.

For governance details, see [[council-of-logic#pre-code-protocol]].

The [[execution-guardian|Guardian]] enforces safety checks.
```

---

## Index Structure

### Master Index

`.claude/VAULT-INDEX.md` contains:

- **Stats table** — counts by type and status
- **Agents section** — ID, path, toolshed, required skills
- **Skills section** — ID, path, category, complements
- **Rules section** — ID, path, authority, scope
- **Blueprints section** — ID, path, toolshed
- **Commands section** — ID, path
- **Alias index** — maps aliases to IDs

### Per-Folder Indexes

| Path                          | Contents                    |
| ----------------------------- | --------------------------- |
| `.claude/agents/index.md`     | Agent hierarchy and routing |
| `.skills/custom/index.md`     | Skills by category          |
| `.claude/rules/index.md`      | Rules by authority          |
| `.claude/blueprints/index.md` | Blueprint DAG summaries     |
| `.claude/commands/index.md`   | Command reference           |

---

## MCP Integration

If `obsidian-claude-code-mcp` is installed, the system enables semantic search.

### Configuration

`.claude/mcp/obsidian.json`:

```json
{
  "name": "obsidian-vault",
  "type": "obsidian-claude-code-mcp",
  "config": {
    "vault_path": ".",
    "index_file": ".claude/VAULT-INDEX.md",
    "port": 22360,
    "search": {
      "semantic": true,
      "fuzzy_threshold": 0.8
    }
  }
}
```

### Without MCP

The system works without MCP using grep-based lookup:

```bash
# Find a skill
grep "scientific-luxury" .claude/VAULT-INDEX.md

# Get the path
| scientific-luxury | `.skills/custom/scientific-luxury/SKILL.md` | active | design | ... |
```

---

## Auto-Maintenance Hooks

### PostCompact Hook (v2.1.76+)

`.claude/hooks/scripts/post-compact-vault.ps1`

Fires after context compaction, injecting vault state reminder:

```
VAULT_SYSTEM_ACTIVE: true
INDEX_PATH: .claude/VAULT-INDEX.md
```

### PostToolUse Hook

`.claude/hooks/scripts/post-file-write-vault.ps1`

Fires after Write/Edit on .md files, reminding to update `modified` date.

### Hook Configuration

Add to `settings.json`:

```json
{
  "hooks": {
    "PostCompact": [".claude/hooks/scripts/post-compact-vault.ps1"],
    "PostToolUse": [".claude/hooks/scripts/post-file-write-vault.ps1"]
  }
}
```

---

## Commands

### pnpm vault:index

Regenerates all indexes:

```bash
pnpm vault:index

# Output:
# Scanning vault...
# Found 100 files
# Generating VAULT-INDEX.md...
# Written: .claude/VAULT-INDEX.md
# Written: .claude/agents/index.md
# ...
# Done!
```

### pnpm vault:validate

Checks for issues:

```bash
pnpm vault:validate

# Output:
# Vault Validator — NodeJS-Starter-V1
#
# Scanning 100 files...
#
# ERRORS (2):
#   [ERROR] .skills/custom/my-skill/SKILL.md
#           Broken wiki-link: [[nonexistent]]
#
# WARNINGS (5):
#   [WARN] .claude/rules/old-rule.md
#          Missing required field: version
#
# Summary:
#   Files scanned: 100
#   Errors: 2
#   Warnings: 5
```

### pnpm vault:adopt

Adds missing frontmatter:

```bash
pnpm vault:adopt --dry-run  # Preview changes
pnpm vault:adopt            # Apply changes
```

---

## Token Economy

The vault system dramatically reduces token usage:

| Operation             | Before                        | After                      | Savings        |
| --------------------- | ----------------------------- | -------------------------- | -------------- |
| Skill discovery       | ~4000 tokens (Glob + reads)   | ~200 tokens (index lookup) | 95%            |
| Agent context loading | ~5000 tokens (full CLAUDE.md) | ~800 tokens (targeted)     | 84%            |
| Relationship mapping  | N/A                           | ~100 tokens per query      | New capability |

### Example: Finding a Skill

**Before (4 tool calls, ~4000 tokens)**:

1. Glob for `**/SKILL.md`
2. Read 3-4 skill files to find the right one
3. Parse each file

**After (1 grep, ~200 tokens)**:

1. `grep "scientific-luxury" .claude/VAULT-INDEX.md`
2. Direct read of the path

---

## Downstream Adoption

Projects using NodeJS-Starter-V1 as a framework can adopt the vault system.

### Full Adoption

```bash
/vault-init --full
```

Installs:

- Frontmatter schema
- Index scripts
- Hooks for auto-maintenance
- MCP configuration

### Minimal Adoption

```bash
/vault-init --minimal
```

Installs:

- Frontmatter schema
- Index scripts only

### Manual Adoption

1. Copy `scripts/vault-*.mjs` to your project
2. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "vault:index": "node scripts/vault-index.mjs",
       "vault:validate": "node scripts/vault-validate.mjs",
       "vault:adopt": "node scripts/adopt-vault.mjs"
     }
   }
   ```
3. Run `pnpm vault:adopt && pnpm vault:index`

---

## Troubleshooting

### Duplicate ID Errors

**Problem**: Multiple files have the same `id` in frontmatter.

**Solution**:

1. Make IDs unique: `my-skill-v2` instead of `my-skill`
2. Use `aliases` for alternative names:
   ```yaml
   id: scientific-luxury-v2
   aliases: [scientific-luxury, design-system]
   ```

### Broken Wiki-Link Errors

**Problem**: A `[[link]]` points to a non-existent ID.

**Solution**:

1. Create the missing file
2. Add the target as an alias to an existing file
3. Correct the link target

### Index Out of Date

**Problem**: New files don't appear in VAULT-INDEX.md.

**Solution**:

```bash
pnpm vault:index
```

### Hook Not Firing

**Problem**: PostCompact hook doesn't inject vault state.

**Solution**:

1. Check Claude Code version is 2.1.76+
2. Verify hook is in `settings.json`:
   ```json
   {
     "hooks": {
       "PostCompact": [".claude/hooks/scripts/post-compact-vault.ps1"]
     }
   }
   ```

---

## Integration with Retrieval-First Protocol

The vault system is priority 0 in the retrieval order (see `.claude/rules/retrieval-first.md`):

| Priority | Source          | Use Case                                  |
| -------- | --------------- | ----------------------------------------- |
| **0**    | **Vault Index** | Agent/skill/rule discovery via wiki-links |
| 1        | NotebookLM      | Architecture, debugging, security         |
| 2        | Context7 MCP    | Library documentation                     |
| 3        | Skills          | Pattern libraries                         |
| 4        | Codebase search | Implementation details                    |
| 5        | Web search      | External information                      |

---

## Claude Code v2.1.76+ Features Used

This system leverages recent Claude Code improvements:

| Feature                 | Version | Usage                                     |
| ----------------------- | ------- | ----------------------------------------- |
| `PostCompact` hook      | v2.1.76 | Vault state preservation after compaction |
| `effort` frontmatter    | v2.1.80 | Skill/command complexity hints            |
| `${CLAUDE_PLUGIN_DATA}` | v2.1.78 | Potential vault state caching             |
| Memory growth fixes     | v2.1.77 | Large vault performance                   |

---

## File Reference

| File                                              | Purpose                   |
| ------------------------------------------------- | ------------------------- |
| `.claude/schemas/frontmatter-schema.yaml`         | Central schema definition |
| `.claude/VAULT-INDEX.md`                          | Master lookup table       |
| `.claude/mcp/obsidian.json`                       | MCP configuration         |
| `.claude/hooks/scripts/post-compact-vault.ps1`    | PostCompact hook          |
| `.claude/hooks/scripts/post-file-write-vault.ps1` | PostToolUse hook          |
| `.claude/commands/vault-init.md`                  | `/vault-init` command     |
| `scripts/vault-index.mjs`                         | Index generator           |
| `scripts/vault-validate.mjs`                      | Validation script         |
| `scripts/adopt-vault.mjs`                         | Frontmatter adoption      |
| `docs/VAULT_INDEX_SYSTEM.md`                      | This documentation        |
