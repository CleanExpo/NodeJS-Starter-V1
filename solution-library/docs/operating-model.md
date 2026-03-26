# Solution Library — Operating Model

## Purpose

The Solution Library is the authoritative source of truth for all reusable Claude development assets.
It serves as the central development operating system for all Claude-based projects.

## Asset Lifecycle

```
Discover → Build → Prove → Promote → Maintain → Deprecate
```

### 1. Discover

Identify a pattern that could be reused across projects.
Use `/lib search` to check it doesn't already exist.

### 2. Build

Implement the pattern in a project context.
Follow TDD discipline (`.skills/custom/tdd/SKILL.md`).

### 3. Prove

The pattern must be reused in >= 2 projects before promotion.
Track usage in `registry/projects.yaml`.

### 4. Promote

Use `/lib push <type> <name>` to initiate promotion.
Requires approval from Senior PM + Senior Orchestrator.
Script: `scripts/solution-library/promote-pattern.ps1`

### 5. Maintain

Owner is responsible for keeping the asset current.
Annual review required. See `docs/deprecation-policy.md`.

### 6. Deprecate

Use `registry/deprecated.yaml` to track with replacement path.
Grace period: 90 days before removal.

## Memory Layers

| Layer           | Purpose                                    | Scope          |
| --------------- | ------------------------------------------ | -------------- |
| `org`           | Organisation-wide rules, never changes     | All projects   |
| `cross_project` | Reusable learnings, cross-cutting concerns | All projects   |
| `project_local` | Project-specific context, team decisions   | Single project |
| `incident`      | Hard-earned debugging lessons              | All projects   |

## Token Economy

- Orchestrator: < 80,000 tokens
- Worker agents: < 60,000 tokens
- Max 6 skills per agent in context
- Use prompt caching for repeated context
- Delegate verbose tasks to subagents

## Distribution

Projects consume this library via git submodule.
See `INSTALL.md` for setup instructions.
