# GSD Integration — Approach C Design Spec

**Goal:** Prevent AI SLOP by adding a context-gathering protocol between user intent and skill execution, using GSD-style commands as the front-door UX.

**GSD (Get Shit Done)** is a context rot prevention framework using fresh agent windows per task and file-based state. This spec adopts GSD's command naming convention and phased structure as the entry-point UX, powered by the existing 65 skills as the execution engine.

**Core Problem:** Agents assume design decisions (hardcoded colours, generic components) instead of reading the project's actual design system, asking for references, or stopping to confirm direction before generating. The result: wasted iterations correcting AI SLOP output.

**Solution:** Simple entry-point commands that force evidence-gathering and explicit Plan Mode confirmation before any generation.

---

## Architecture

Three layers:

**Front Door (Commands)**
Entry-point commands in `.claude/commands/`. Users type `/new-feature`, `/discuss`, `/execute`, `/done` — not raw skill names. Each command automatically invokes the context protocol before any skill execution.

**Middle Layer (Context Protocol)**
A new skill (`context-protocol`) that acts as slop-prevention middleware. Every command passes through one of two paths:

- **Design path** — triggered by design keywords. Gathers sources, produces a Plan Mode block, waits for approval.
- **Code path** — auto-reads relevant files silently, produces a Plan Mode block, waits for approval.

**Execution Engine (Existing 65 Skills)**
No changes to existing skills. They receive properly-gathered context instead of assumptions.

```
User intent
    ↓
/command (entry point)
    ↓
context-protocol: detect design vs code
    ↓
Gather sources (read tokens / ask for URL/image / read relevant files)
    ↓
Plan Mode block — agent shows evidence + proposed approach, user confirms
    ↓
Skill execution (existing 65 skills)
    ↓
Verified output
```

---

## Plan Mode Definition

**Plan Mode** is a formatted response block the agent produces before any code generation. It is not a Claude Code toggle or file flag — it is a structured output that shows:

1. What context was gathered (files read, URLs fetched, tokens found)
2. The proposed approach
3. An explicit question: "Does this look right? Shall I proceed?"

Execution does not begin until the user replies with approval. This is the slop-prevention gate. Every command path terminates at a Plan Mode block before touching any file.

---

## Context-Gathering Protocol

### Trigger Detection

Scan task description for signal words:

```
DESIGN triggers: logo, icon, UI, component, colour, color, style, animation,
                 layout, design, theme, typography, font, button, card, modal,
                 landing page, hero, navbar, sidebar

CODE triggers: everything else → code path
```

### Design Path

1. Read `apps/web/lib/design-tokens.ts` — always first
2. Check if task mentions a URL → fetch it for reference
3. Check if task mentions an image URL → use it
4. If no reference provided → ask exactly one question: "What's the reference? (URL, image URL, or describe the style)"
5. Read the `## Colour System` section of `.skills/custom/scientific-luxury/SKILL.md` — this section only, not the full file
6. Produce Plan Mode block: show gathered context + proposed approach
7. Wait for user approval
8. Execute using appropriate skills

### Code Path

1. Auto-detect relevant files from task description using Glob/Grep on file names, route paths, function names, or module names mentioned
2. Read those files silently — no interruptions
3. If no relevant files can be identified from the task description, ask exactly one question: "Which files should I look at?"
4. Produce Plan Mode block: show what was found, what will change, why
5. Wait for user approval
6. Execute using appropriate skills

### The One-Question Rule

Both paths allow exactly one clarifying question before producing the Plan Mode block. "What's the reference?" covers URL, image, and style description for design tasks. "Which files should I look at?" covers unknown scope for code tasks. No follow-up questions until after Plan Mode approval.

---

## Files

### New Files (Create)

| File                                       | Purpose                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `.claude/commands/discuss.md`              | Context-gathering conversation before any work starts — invoke before `/new-feature` for ambiguous requests |
| `.claude/commands/execute.md`              | Runs the current `.planning/PLAN.md` file via existing skills                                               |
| `.claude/commands/done.md`                 | Post-implementation verification — delegates to `verification-before-completion` skill                      |
| `.skills/custom/context-protocol/SKILL.md` | Slop-prevention middleware — trigger detection + source-gathering logic                                     |
| `.claude/rules/slop-prevention.md`         | Always-on rule: never assume design values, always read or ask                                              |

**Note on naming:** The command is `/done` (not `/verify`) to avoid collision with the existing `.claude/commands/verify.md`, which runs a TypeScript/directory foundation check. These are different operations — `/verify` checks project structure, `/done` confirms feature implementation is complete.

### PLAN.md Contract

The `/execute` command reads `.planning/PLAN.md`. This file:

- Lives at `.planning/PLAN.md` in the project root
- Is created by running `/discuss` (which produces the plan as output) or written manually
- Contains a sequence of numbered tasks with file paths, steps, and verification commands
- `/execute` reads the file, identifies incomplete tasks (unchecked `- [ ]` items), and delegates them to the appropriate skills in order

If `.planning/PLAN.md` does not exist when `/execute` is invoked, the command responds: "No PLAN.md found at `.planning/PLAN.md`. Run `/discuss` to create one."

### Modified Files

| File                              | Change                                                                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/commands/new-feature.md` | Add Step 0 at the top: "Before scaffolding any files, invoke the context-protocol skill with the feature name as input. Wait for Plan Mode approval before proceeding to Step 1 (API Routes)." |

**Note on new-feature.md:** The existing command (line 1: "Scaffold a complete feature with all required files") proceeds directly to file generation. The context-protocol is inserted as Step 0 — a mandatory gate before the scaffolding begins. The existing Steps 1–8 are unchanged.

### Unchanged

All 65 existing skills in `.skills/custom/`. The existing `.claude/commands/verify.md` is unchanged.

---

## Data Flow Examples

### Example A: Design Task

```
User: /new-feature "Add a hero section to the landing page"
  ↓
new-feature.md: Step 0 — invoke context-protocol
  ↓
context-protocol detects: "hero", "landing page" → DESIGN path
  ↓
Auto-reads: apps/web/lib/design-tokens.ts
  ↓
No URL/image in task description
  ↓
Asks: "What's the reference? (URL, image URL, or describe the style)"
User: "https://linear.app"
  ↓
Fetches URL for visual reference
  ↓
Reads: scientific-luxury SKILL.md — `## Colour System` section only
  ↓
PLAN MODE BLOCK:
  "Context gathered:
   ✓ Design tokens: OLED black #050505, Cyan #00F5FF accent, rounded-sm corners
   ✓ Reference: Linear.app hero — large sans-serif headline, minimal whitespace, dark bg
   ✓ Animation system: Framer Motion only

   Proposed approach:
   Full-bleed dark hero (#050505), 72px headline in Inter, cyan (#00F5FF) CTA button
   with rounded-sm, Framer Motion fade-in-up on scroll. No gradients. No stock imagery.

   Does this look right? Shall I proceed?"
  ↓
User: "Yes"
  ↓
scientific-luxury skill executes with this context (plus `dashboard-patterns` skill if the task involves data display components)
```

### Example B: Code Task

```
User: /new-feature "Fix the auth token refresh logic"
  ↓
new-feature.md: Step 0 — invoke context-protocol
  ↓
context-protocol detects: no design keywords → CODE path
  ↓
Auto-detects from "auth token refresh": middleware.ts, api/client.ts, auth/jwt.py
  ↓
Reads silently:
  apps/web/middleware.ts
  apps/web/lib/api/client.ts
  apps/backend/src/auth/jwt.py
  ↓
PLAN MODE BLOCK:
  "Context gathered:
   ✓ middleware.ts:47 — token refresh called but not awaited (missing await)
   ✓ client.ts:23 — 401 handler retries immediately without waiting for refresh to complete
   ✓ jwt.py:89 — refresh endpoint issues new token correctly, no server-side bug

   Proposed fix:
   1. Add await to refresh call in middleware.ts:47
   2. Add mutex/lock in client.ts to queue 401 retries until refresh completes

   Does this look right? Shall I proceed?"
  ↓
User: "Yes"
  ↓
systematic-debugging + tdd skills execute
```

---

## Slop-Prevention Rule (always-on)

`.claude/rules/slop-prevention.md` loads for all sessions:

- Never hardcode colour values — read from `apps/web/lib/design-tokens.ts` first
- Never assume component style — the project uses Scientific Luxury (OLED Black `#050505`, spectral colours, `rounded-sm`, Framer Motion only)
- Never generate UI without producing a Plan Mode block and receiving user approval
- Never use Tailwind default colours as design decisions — only as layout utilities
- If a design token is not in `design-tokens.ts`, ask before inventing one

---

## Testing

Manual verification after implementation. Pass criteria are the observable Plan Mode block output.

| Test                     | Action                                                     | Pass criteria                                                                                       |
| ------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1 — Design path trigger  | `/new-feature "Add a button component"`                    | Agent asks "What's the reference?" before any file is created                                       |
| 2 — Design path with URL | `/new-feature "Add a hero based on https://stripe.com"`    | Plan Mode block shows: "✓ Reference: stripe.com fetched" — no request for reference URL             |
| 3 — Code path            | `/new-feature "Fix the login API"`                         | Plan Mode block shows file names actually read (e.g. "✓ auth/jwt.py read") before any changes       |
| 4 — Slop prevention      | `/new-feature "Design a dashboard card with cyan accents"` | Plan Mode block shows "✓ Design tokens read: Cyan #00F5FF" — token file was read first, not assumed |
| 5 — No PLAN.md           | `/execute` with no `.planning/PLAN.md` present             | Agent responds: "No PLAN.md found at `.planning/PLAN.md`..."                                        |

---

## Key Constraints

- **No new infrastructure** — commands and one new skill only
- **No changes to existing skills** — the execution engine is untouched
- **One question maximum per path** — before Plan Mode, not after
- **Plan Mode is non-negotiable** — fires for every path, every time, before any file is written
- **Design tokens file is always the first read** on any design-path task
- **`/verify` command is unchanged** — foundation check command remains as-is; post-feature verification uses `/done`
- **PLAN.md location is `.planning/PLAN.md`** — always this path, no alternatives
