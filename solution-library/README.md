# Solution Library

> **Authoritative source** for reusable Claude development assets across all projects.

## What This Is

The Solution Library is the central development operating system for Claude-based projects.
It provides a governed hub of reusable agents, skills, workflows, and evals that can be
shared across projects via git submodule.

## Quick Start

```bash
# List all available assets
/lib list

# Search for a skill
/lib search "rate limiting"

# Load a workflow for your project
/lib use spec-to-build

# Promote a proven pattern
/lib push skill my-new-pattern

# Check library health
/lib status
```

## Commands

| Command                   | Purpose                           |
| ------------------------- | --------------------------------- |
| `/lib add <type> <name>`  | Add new asset to library          |
| `/lib use <workflow>`     | Load workflow for active project  |
| `/lib push <type> <name>` | Promote proven pattern to library |
| `/lib list [type]`        | List available assets             |
| `/lib search <query>`     | Search registry + semantic        |
| `/lib sync`               | Pull/push library updates         |
| `/lib audit`              | Run self-improvement audit        |
| `/lib status`             | Show library health               |

## Governance

All library changes require approval from:

- **Senior Project Manager** — scope, priorities, acceptance criteria
- **Senior Orchestrator** — routing, skill selection, promotion decisions

### Promotion Rules

1. Pattern must be reused in >= 2 projects
2. Must pass eval pack
3. Must have documentation
4. Must have an assigned owner

## Directory Structure

```
solution-library/
├── library.yaml          # Central configuration
├── registry/             # Asset registries (YAML)
│   ├── agents.yaml       # All agents with metadata
│   ├── skills.yaml       # All skills with categories
│   ├── workflows.yaml    # Workflow definitions
│   ├── projects.yaml     # Projects consuming the library
│   ├── deprecated.yaml   # Deprecated items
│   └── promotion-log.yaml # Promotion audit trail
├── docs/                 # Operating documentation
│   ├── operating-model.md
│   ├── promotion-policy.md
│   ├── deprecation-policy.md
│   └── memory-policy.md
└── evals/                # Evaluation packs
    ├── core/
    ├── frontend/
    ├── backend/
    └── security/
```

## Using as a Git Submodule

See [INSTALL.md](INSTALL.md) for instructions on adding this library to your project.
