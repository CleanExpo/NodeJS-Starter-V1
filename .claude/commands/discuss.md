# Discuss Command

Start a context-gathering conversation before beginning any task. Use this when a request is ambiguous or when you want to think through a feature before committing to an approach.

**Usage**: `/discuss <topic or request>`

## What This Does

1. Invokes the `context-protocol` skill for the topic: `$ARGUMENTS`
2. Gathers context (design tokens if visual, relevant files if code)
3. Asks clarifying questions ONE AT A TIME to understand:
   - What problem is being solved
   - What success looks like
   - Any constraints (existing patterns, deadlines, scope limits)
4. Proposes 2-3 approaches with trade-offs
5. Produces a **Plan Mode block** — a formatted output showing: context gathered, proposed approach, and an explicit confirmation question. No work starts until the user approves this block.
6. Asks: "Shall I write this to `.planning/PLAN.md`?" — waits for explicit user confirmation before writing anything
7. If confirmed, writes the agreed plan to `.planning/PLAN.md`

## Rules

- One question per message — never fire a list of questions
- Never start writing code during a `/discuss` session
- The output of `/discuss` is clarity and optionally a `.planning/PLAN.md` — not implementation
- If this is a design task, the context-protocol DESIGN PATH runs automatically
- If this is a code task, the context-protocol CODE PATH runs automatically
