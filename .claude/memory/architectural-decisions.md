---
id: architectural-decisions
type: memory
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Architectural Decisions Log
> Append-only. Format: [DD/MM/YYYY] DECISION: X | REASON: Y | ALTERNATIVES REJECTED: Z

## Decisions

<!-- Agents append entries below. Never delete existing entries. -->

[03/03/2026] DECISION: Implement 4-pillar context drift prevention system | REASON: Claude Code compaction silently destroys CLAUDE.md rules; documented in Anthropic issues #9796, #13919, #14258 | ALTERNATIVES REJECTED: Relying on compaction summary (lossy), manual re-injection (error-prone)
