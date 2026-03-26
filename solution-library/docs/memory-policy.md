# Memory Policy

## Memory Layers

### Layer 1: `org` (Organisation-wide)

- Rules that apply to ALL projects
- Never modified without explicit consensus
- Stored in: `.claude/memory/CONSTITUTION.md`
- Examples: en-AU locale, OLED Black design system, TDD enforcement

### Layer 2: `cross_project` (Cross-project learnings)

- Patterns that proved valuable across >= 2 projects
- Promoted via standard promotion process
- Stored in: `solution-library/registry/`
- Examples: rate limiter patterns, auth flows, webhook validation

### Layer 3: `project_local` (Project-specific)

- Team decisions, local conventions, project context
- Stored in: `C:\Users\..\.claude\projects\...\memory\`
- Examples: which Stripe plan is used, deploy targets, team preferences

### Layer 4: `incident` (Hard-earned lessons)

- Post-mortems, debugging discoveries, gotchas
- Never deleted — only annotated
- Stored in: `.claude/memory/architectural-decisions.md`
- Examples: "Supabase removed — use NullStateStore", auth cookie format

## Update Protocol

| Layer         | Who Can Update      | How                                  |
| ------------- | ------------------- | ------------------------------------ |
| org           | Human only          | Direct edit to CONSTITUTION.md       |
| cross_project | Senior Orchestrator | `/lib push` promotion flow           |
| project_local | Any agent           | Write to project memory files        |
| incident      | Any agent           | Append to architectural-decisions.md |

## Memory Anti-Patterns

- Never store code patterns in memory (use skills instead)
- Never store git history in memory (use `git log`)
- Never duplicate CLAUDE.md content in memory
- Never store ephemeral task state in persistent memory
