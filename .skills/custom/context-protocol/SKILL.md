---
name: context-protocol
description: Slop-prevention middleware. Run before any design or code task to gather sources, then produce a Plan Mode block before touching any file. Eliminates hardcoded colours and generic components caused by agents assuming design decisions.
triggers:
  - any /new-feature invocation
  - any /discuss invocation
  - any task involving UI, components, or code modification
---

# Context Protocol — Slop Prevention Middleware

## Purpose

Force agents to gather evidence before generating. No file is written until a Plan Mode block is shown and the user approves. This prevents AI SLOP: hardcoded colours, generic components, and assumed design decisions.

## Step 1: Detect Path

Scan the task description for DESIGN triggers:

```
logo, icon, UI, component, colour, color, style, animation, layout,
design, theme, typography, font, button, card, modal, landing page,
hero, navbar, sidebar, dashboard
```

Match case-insensitively.

- Match found → **DESIGN PATH**
- No match → **CODE PATH**

---

## DESIGN PATH

### 1. Read design tokens (ALWAYS FIRST)

Read `apps/web/lib/design-tokens.ts`. Extract:

- Background colours (BACKGROUNDS object)
- Spectral colours (SPECTRAL object)
- Text opacities (TEXT object)
- Border styles (BORDERS object)

If the file does not exist, note "design-tokens.ts not found" and ask the user where to find the project's colour tokens.

### 2. Check for reference in task description

Scan the task description for:

- A URL (http/https) → fetch it, note key visual characteristics
- An image URL → note it for reference
- A style description ("minimal", "dark", "glassmorphism") → note it

### 3. If no reference found — ask ONE question

> "What's the reference? (URL, image URL, or describe the style)"

Wait for the answer. Do NOT ask a second question.

### 4. Read scientific-luxury colour context

Read the `## Colour System` section of `.skills/custom/scientific-luxury/SKILL.md`.
Read that section only — not the full file.
If the `## Colour System` heading is not found, read the first 60 lines of the file only.

### 5. Produce Plan Mode block

Output this block before writing a single line of code:

```
CONTEXT GATHERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Design tokens read: [list key values found — e.g. "bg #050505, cyan #00F5FF, rounded-sm"]
✓ Reference: [URL fetched / image URL / style description — if a style description was provided with no URL, quote it verbatim here]
✓ Colour system: Scientific Luxury — OLED black, spectral accents, Framer Motion only

PROPOSED APPROACH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2-4 sentences describing exactly what will be built, using actual token values]

Does this look right? Shall I proceed?
```

### 6. Wait for approval

Do NOT write any file until the user confirms. If they change direction, update the proposed approach and show the block again.

---

## CODE PATH

### 1. Auto-detect relevant files

From the task description, identify file candidates using these signals:

- Route paths mentioned ("auth", "login", "api/users") → look in `apps/web/` and `apps/backend/src/`
- Function or class names → Grep for them
- Module names → Glob for matching files

Read the identified files silently. No output during this step.

### 2. If no files can be identified — ask ONE question

> "Which files should I look at?"

Wait for the answer. Do NOT ask a second question.

### 3. Produce Plan Mode block

```
CONTEXT GATHERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ [filename]: [one-line summary of what was found — e.g. "middleware.ts:47 — refresh not awaited"]
✓ [filename]: [one-line summary]

PROPOSED APPROACH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2-4 sentences describing exactly what will change and why, referencing actual line numbers]

Does this look right? Shall I proceed?
```

### 4. Wait for approval

Do NOT modify any file until the user confirms. If the user redirects, revise the PROPOSED APPROACH section and show the block again.

---

## Hard Rules

1. **Design tokens file is always read first** on any DESIGN PATH task — before asking for a reference
2. **One question maximum** per path — abbreviated labels: "What's the reference?" (full string in DESIGN Step 3) or "Which files?" (full string in CODE Step 2) — never ask both
3. **Plan Mode block is non-negotiable** — fires every time, for every path, before any file is written
4. **Never hardcode a colour** that is not in `apps/web/lib/design-tokens.ts`
5. **Never use Tailwind default colours** as design decisions — only as spacing/layout utilities
