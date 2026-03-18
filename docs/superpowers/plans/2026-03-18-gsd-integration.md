# GSD Integration — Context Protocol + Slop Prevention Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a context-gathering protocol to all Claude Code commands that forces agents to read design tokens and relevant files before entering Plan Mode — eliminating AI SLOP (hardcoded colours, generic components) caused by agents assuming design decisions.

**Architecture:** Six files total — one core skill (context-protocol) acts as slop-prevention middleware, one always-on rule reinforces it every session, three new commands provide GSD-style entry points, and one existing command gets a mandatory Step 0 gate. No existing skills are modified.

**Tech Stack:** Claude Code markdown commands (`.claude/commands/`), Claude Code skills (`.skills/custom/`), Claude Code rules (`.claude/rules/`). No code compilation, no test runner. Verification is manual behaviour testing.

**Spec:** `docs/superpowers/specs/2026-03-18-gsd-integration-design.md`

---

## File Map

| Action | File                                       | Responsibility                                                                |
| ------ | ------------------------------------------ | ----------------------------------------------------------------------------- |
| CREATE | `.skills/custom/context-protocol/SKILL.md` | Core middleware — trigger detection, source gathering, Plan Mode block format |
| CREATE | `.claude/rules/slop-prevention.md`         | Always-on session rule — never assume design values                           |
| CREATE | `.claude/commands/discuss.md`              | Context-gathering conversation before any task                                |
| CREATE | `.claude/commands/execute.md`              | Run `.planning/PLAN.md` via existing skills                                   |
| CREATE | `.claude/commands/done.md`                 | Post-implementation verification gate                                         |
| MODIFY | `.claude/commands/new-feature.md`          | Insert Step 0 (context-protocol gate) before scaffolding                      |
| CREATE | `.planning/.gitkeep`                       | Directory placeholder for PLAN.md                                             |

---

## Task 1: Create the context-protocol skill

**This is the core. Everything else wires into it.**

**Files:**

- Create: `.skills/custom/context-protocol/SKILL.md`

- [ ] **Step 1: Create the skill file**

Create `.skills/custom/context-protocol/SKILL.md` with the exact content below:

````markdown
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

### 5. Produce Plan Mode block

Output this block before writing a single line of code:

```
CONTEXT GATHERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Design tokens read: [list key values found — e.g. "bg #050505, cyan #00F5FF, rounded-sm"]
✓ Reference: [URL fetched / image URL / style description noted]
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

Do NOT modify any file until the user confirms.

---

## Hard Rules

1. **Design tokens file is always read first** on any DESIGN PATH task — before asking for a reference
2. **One question maximum** per path — "What's the reference?" or "Which files?" — never both
3. **Plan Mode block is non-negotiable** — fires every time, for every path, before any file is written
4. **Never hardcode a colour** that is not in `apps/web/lib/design-tokens.ts`
5. **Never use Tailwind default colours** as design decisions — only as spacing/layout utilities
````

- [ ] **Step 2: Verify the file was created**

```bash
ls .skills/custom/context-protocol/SKILL.md
```

Expected: file exists, no error.

- [ ] **Step 3: Commit**

```bash
git add .skills/custom/context-protocol/SKILL.md
git commit -m "feat(skills): add context-protocol slop-prevention middleware"
```

---

## Task 2: Create the always-on slop-prevention rule

**This loads every session and reinforces the protocol without the user needing to invoke it.**

**Files:**

- Create: `.claude/rules/slop-prevention.md`

- [ ] **Step 1: Create the rule file**

Create `.claude/rules/slop-prevention.md` with the exact content below:

```markdown
# Slop Prevention — Always-On Rule

> **Authority**: Loaded every session. Overrides default behaviour for design tasks.

## The Prime Directive

**Never assume design values. Always read or ask.**

## Colour Rules

- Before using ANY colour value in a component, read `apps/web/lib/design-tokens.ts`
- The project uses Scientific Luxury design system: OLED black `#050505`, spectral accents
- Spectral colours: Cyan `#00F5FF` (active), Emerald `#00FF88` (success), Amber `#FFB800` (warning), Red `#FF4444` (error), Magenta `#FF00FF` (escalation)
- Corners: `rounded-sm` only — never `rounded-lg`, `rounded-full`, or `rounded-md`
- Animations: Framer Motion only — never CSS transitions, never `transition-all`
- Borders: single pixel `rgba(255,255,255,0.1)` — never thick borders, never coloured borders

## Before Any UI Generation

1. Read `apps/web/lib/design-tokens.ts`
2. Ask for a reference URL or image if the task is visual and none was provided
3. Show a Plan Mode block with the gathered context
4. Wait for approval

## Banned Phrases

Never say these without evidence:

- "I'll use a standard dark theme"
- "I'll use a blue accent colour"
- "I'll use typical padding"
- "should work with the existing styles"

## Recovery

If you catch yourself about to hardcode a colour or style value, stop. Invoke the context-protocol skill instead.
```

- [ ] **Step 2: Verify the file was created**

```bash
ls .claude/rules/slop-prevention.md
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/slop-prevention.md
git commit -m "feat(rules): add always-on slop-prevention rule"
```

---

## Task 3: Create the `/discuss` command

**Provides a context-gathering conversation entry point before any task. Use this for ambiguous requests before `/new-feature`.**

**Files:**

- Create: `.claude/commands/discuss.md`

- [ ] **Step 1: Create the command file**

Create `.claude/commands/discuss.md` with the exact content below:

```markdown
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
5. Produces a Plan Mode block summarising the agreed direction
6. If a plan will be needed, writes it to `.planning/PLAN.md`

## Rules

- One question per message — never fire a list of questions
- Never start writing code during a `/discuss` session
- The output of `/discuss` is clarity and optionally a `.planning/PLAN.md` — not implementation
- If this is a design task, the context-protocol DESIGN PATH runs automatically
- If this is a code task, the context-protocol CODE PATH runs automatically
```

- [ ] **Step 2: Verify**

```bash
ls .claude/commands/discuss.md
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/discuss.md
git commit -m "feat(commands): add /discuss context-gathering command"
```

---

## Task 4: Create the `/execute` command

**Runs an existing `.planning/PLAN.md` file task by task using existing skills.**

**Files:**

- Create: `.claude/commands/execute.md`
- Create: `.planning/.gitkeep`

- [ ] **Step 1: Create the planning directory placeholder**

```bash
mkdir -p .planning
touch .planning/.gitkeep
```

- [ ] **Step 2: Create the command file**

Create `.claude/commands/execute.md` with the exact content below:

```markdown
# Execute Command

Execute the current implementation plan from `.planning/PLAN.md`.

**Usage**: `/execute`

## What This Does

1. Reads `.planning/PLAN.md`
2. If the file does not exist, responds: "No PLAN.md found at `.planning/PLAN.md`. Run `/discuss` to create one."
3. Identifies all incomplete tasks — lines matching `- [ ]`
4. For each incomplete task in order:
   a. Shows the task description
   b. Invokes the appropriate skill(s) based on task type:
   - Design task → `context-protocol` + `scientific-luxury` skill
   - Code task → `context-protocol` + `tdd` skill
   - Debug task → `systematic-debugging` skill
   - Verification task → `verification-before-completion` skill
     c. Marks the task complete (`- [x]`) in PLAN.md when done
     d. Commits after each completed task
5. After all tasks complete, invokes `verification-before-completion`

## Rules

- Never skip the context-protocol step for design or code tasks
- Never mark a task `[x]` without running the verification command in that task
- Never execute tasks out of order
- If a task fails, stop and report — do not continue to the next task
- Keep PLAN.md updated as tasks complete so progress survives session interruption
```

- [ ] **Step 3: Verify both files**

```bash
ls .claude/commands/execute.md .planning/.gitkeep
```

Expected: both files exist.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/execute.md .planning/.gitkeep
git commit -m "feat(commands): add /execute command and .planning/ directory"
```

---

## Task 5: Create the `/done` command

**Post-implementation verification gate. Different from the existing `/verify` (which checks TypeScript/directory structure).**

**Files:**

- Create: `.claude/commands/done.md`

- [ ] **Step 1: Create the command file**

Create `.claude/commands/done.md` with the exact content below:

````markdown
# Done Command

Verify that a recently implemented feature is complete before claiming it is finished.

**Usage**: `/done`

> **Note**: This is different from `/verify`. The `/verify` command checks foundation architecture (TypeScript config, directory structure, circular dependencies). This command checks that the feature you just built actually works end-to-end.

## What This Does

Invokes the `verification-before-completion` skill, which requires:

1. **Run the relevant tests**
   - Frontend: `pnpm test --filter=web`
   - Backend: `cd apps/backend && uv run pytest -v`
   - Both: `pnpm turbo run test`

2. **Type check**
   ```bash
   pnpm turbo run type-check
   ```
````

3. **Manual smoke test**
   - Open the feature in the browser (or call the endpoint)
   - Verify the happy path works
   - Verify the error path works

4. **Report**
   Output a checklist:

   ```
   DONE VERIFICATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✓ / ✗  Tests: [pass/fail count]
   ✓ / ✗  Type check: [pass/fail]
   ✓ / ✗  Smoke test: [what was tested]

   VERDICT: [COMPLETE / NOT COMPLETE]

   If NOT COMPLETE:
   Blockers: [list what failed]
   Next action: [specific step to fix]
   ```

## Rules

- Never output "Done!" or "Complete!" without running the commands above
- Never skip the manual smoke test
- If any step fails, output the blocker and stop — do not claim completion

````

- [ ] **Step 2: Verify**

```bash
ls .claude/commands/done.md
````

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/done.md
git commit -m "feat(commands): add /done post-implementation verification command"
```

---

## Task 6: Modify `/new-feature` to add the context-protocol gate

**Inserts Step 0 at the top of the existing scaffolding command. The existing Steps 1-8 are unchanged.**

**Files:**

- Modify: `.claude/commands/new-feature.md` (read it first, then edit)

- [ ] **Step 1: Read the current file**

Read `.claude/commands/new-feature.md` in full. Note the current first line (it begins "# New Feature Command").

- [ ] **Step 2: Insert Step 0 before Step 1**

The file currently starts with:

```
# New Feature Command

Scaffold a complete feature with all required files.

**Usage**: `/new-feature <name>`

Create a complete feature called '$ARGUMENTS':

## 1. API Routes
```

Change it to:

```
# New Feature Command

Scaffold a complete feature with all required files.

**Usage**: `/new-feature <name>`

Create a complete feature called '$ARGUMENTS':

## 0. Context Gate (MANDATORY — do not skip)

Before creating any files, invoke the `context-protocol` skill for this task: `$ARGUMENTS`

The skill will detect the correct path (DESIGN or CODE) automatically based on the task description.

**Do not proceed to Step 1 until the Plan Mode block has been shown and the user has approved.**

## 1. API Routes
```

- [ ] **Step 3: Verify the change**

```bash
head -30 .claude/commands/new-feature.md
```

Expected: `## 0. Context Gate` appears before `## 1. API Routes`.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/new-feature.md
git commit -m "feat(commands): add context-protocol gate to /new-feature as Step 0"
```

---

## Task 7: Manual Behaviour Verification

**These are the acceptance tests. Run each one in a new Claude Code session (fresh context) to verify the protocol fires correctly.**

**No files to create. This task is verification only.**

- [ ] **Test 1 — Design path trigger**

In a new Claude Code session, run:

```
/new-feature "Add a button component"
```

Expected: Claude asks "What's the reference? (URL, image URL, or describe the style)" before creating any file.

Pass: Question appears. No file written yet.
Fail: Claude starts writing files immediately without asking.

- [ ] **Test 2 — Design path with URL provided**

In a new Claude Code session, run:

```
/new-feature "Add a hero section based on https://stripe.com"
```

Expected: Claude produces a CONTEXT GATHERED block showing `✓ Reference: stripe.com fetched` without asking for a reference URL.

Pass: Plan Mode block appears. `✓ Reference:` line is present.
Fail: Claude asks for a reference despite URL being in the task.

- [ ] **Test 3 — Code path**

In a new Claude Code session, run:

```
/new-feature "Fix the login API"
```

Expected: Claude produces a CONTEXT GATHERED block showing the file names it read (e.g. `✓ apps/backend/src/auth/jwt.py`) before any changes.

Pass: Plan Mode block lists actual file names read.
Fail: Claude starts editing files without showing what it read.

- [ ] **Test 4 — Slop prevention (design tokens are read, not assumed)**

In a new Claude Code session, run:

```
/new-feature "Design a dashboard card with cyan accents"
```

Expected: Plan Mode block includes `✓ Design tokens read: bg #050505, cyan #00F5FF` — confirming the token file was read, not assumed.

Pass: Token file values appear in the CONTEXT GATHERED block.
Fail: Claude uses `#00F5FF` without showing it came from design-tokens.ts.

- [ ] **Test 5 — /execute with no PLAN.md**

In a new Claude Code session, run:

```
/execute
```

Expected: Claude responds "No PLAN.md found at `.planning/PLAN.md`. Run `/discuss` to create one."

Pass: Error message matches expected text.
Fail: Claude crashes, asks a confusing question, or starts doing work without a plan.

- [ ] **Step: Record results and close plan**

After running all 5 tests:

1. Mark each passing test `[x]`
2. If any test failed, create a follow-up task in the plan — do not close until all 5 pass
3. When all 5 pass, update `.claude/memory/current-state.md` — set "Active Task" to "GSD Integration complete"
4. Commit the final checked state:

```bash
git add docs/superpowers/plans/2026-03-18-gsd-integration.md .claude/memory/current-state.md
git commit -m "chore(gsd): GSD integration complete — all 5 behaviour tests passing"
```
