# Capability Uplift Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace LLM default patterns across 4 new uplift skills, 3 agent transforms, and 13 skill retrofits using the Capability Uplift directory standard.

**Architecture:** Golden Example → Replicate. Task 1 builds the exemplar `document-formatting-uplift` skill with full directory structure. Tasks 2-4 replicate the pattern for remaining skills. Tasks 5-7 transform agents. Tasks 8-10 retrofit existing skills in batches. Task 11 updates the registry.

**Tech Stack:** Markdown skills (SKILL.md + references/ + assets/), agent definitions (.claude/agents/), AGENTS.md registry

**Spec:** `docs/superpowers/specs/2026-03-26-capability-uplift-design.md`

---

## Task 1: Golden Example — `document-formatting-uplift` (Full Detail)

**Files:**
- Create: `.skills/custom/document-formatting-uplift/SKILL.md`
- Create: `.skills/custom/document-formatting-uplift/references/anti-patterns.md`
- Create: `.skills/custom/document-formatting-uplift/references/standards.md`
- Create: `.skills/custom/document-formatting-uplift/references/standards-generic.md`
- Create: `.skills/custom/document-formatting-uplift/assets/templates/scientific-luxury/technical-spec.md`
- Create: `.skills/custom/document-formatting-uplift/assets/templates/scientific-luxury/user-guide.md`
- Create: `.skills/custom/document-formatting-uplift/assets/templates/generic/technical-spec.md`
- Create: `.skills/custom/document-formatting-uplift/assets/templates/generic/user-guide.md`
- Create: `.skills/custom/document-formatting-uplift/assets/examples/before-after.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p ".skills/custom/document-formatting-uplift/references"
mkdir -p ".skills/custom/document-formatting-uplift/assets/templates/scientific-luxury"
mkdir -p ".skills/custom/document-formatting-uplift/assets/templates/generic"
mkdir -p ".skills/custom/document-formatting-uplift/assets/examples"
```

- [ ] **Step 2: Create SKILL.md**

Write `.skills/custom/document-formatting-uplift/SKILL.md` with:

```yaml
---
id: document-formatting-uplift
name: document-formatting-uplift
type: rigid
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
metadata:
  author: NodeJS-Starter-V1
  locale: en-AU
description: >
  Override default LLM document formatting. Replaces wall-of-bullets, header spam,
  and AI prose tells with prose-first hierarchy, typographic rhythm, and intentional
  whitespace. Triggers on document creation, reports, guides, specs, and READMEs.
---
```

**Sections to include:**

1. **When to Apply** — Positive triggers: "write a document", "write a report", "write a guide", "format document", "README", "specification", "proposal", "documentation style", "technical writing", "formatting". Negative triggers: code-only tasks, API implementations, test writing.

2. **Banned Defaults** — Table of 12 anti-patterns (from spec lines 78-90). Each row: `| # | Banned Pattern | Why It's Bad | Replacement |`. Reference `references/anti-patterns.md` for full before/after examples.

3. **Replacement Standards** — Prose-first hierarchy rules:
   - Lead with a direct statement, not a summary of what follows
   - Use prose paragraphs for connected ideas; bullets only for genuinely unordered items
   - Maximum 2 heading levels per page section (H2 + H3, not H2 + H3 + H4)
   - Whitespace rhythm: section gap > paragraph gap > line gap (geometric ratio)
   - Tables for structured data only, not for comparisons that should be prose
   - Reference `references/standards.md` (SL variant) or `references/standards-generic.md` (portable)

4. **Document Archetypes** — 5 types with structure rules. Each references a template in `assets/templates/`:
   - Technical Spec: Problem → Approach → Design → Implementation → Verification
   - User Guide: Goal → Prerequisites → Steps → Troubleshooting
   - Report: Summary → Findings → Evidence → Recommendations
   - Proposal: Context → Problem → Solution → Cost → Timeline
   - README: What → Why → Quick Start → Architecture → Contributing

5. **en-AU Enforcement** — colour, behaviour, optimisation, organised, licence (noun). DD/MM/YYYY. AUD ($). Sentence case headers.

6. **Eval Criteria** — PASS/FAIL checklist:
   - [ ] No wall-of-bullets where prose is appropriate
   - [ ] No AI prose tells ("Let's dive in", "comprehensive", "It's worth noting")
   - [ ] Maximum 2 heading levels per section
   - [ ] Prose paragraphs for connected ideas
   - [ ] en-AU spelling throughout
   - [ ] Sentence case headers (not Title Case)
   - [ ] No emoji in headers or bullets
   - [ ] No exclamation marks in technical docs

- [ ] **Step 3: Create references/anti-patterns.md**

Full catalogue of 12 banned patterns. For EACH pattern, include:
- **Name**: The anti-pattern
- **What it looks like** (before): 3-5 line example of the bad default
- **Why it's bad**: One sentence explaining the problem
- **What to do instead** (after): 3-5 line example of the replacement
- **Detection**: How to spot this pattern programmatically (grep pattern or visual cue)

- [ ] **Step 4: Create references/standards.md (Scientific Luxury variant)**

Document styling for Scientific Luxury projects:
- Code blocks: Dark background (`#0a0a0a`), spectral syntax highlighting (Cyan for keywords, Emerald for strings, Amber for numbers, Red for errors)
- Status annotations: Use spectral colours inline — `[ACTIVE]` in Cyan, `[COMPLETE]` in Emerald, `[WARNING]` in Amber, `[ERROR]` in Red
- Data/metrics: JetBrains Mono font, tabular alignment
- Titles: Editorial New font reference
- Section dividers: Single-pixel `border-white/10` (not `---` markdown rulers)
- Quote blocks: Left border in spectral Cyan

- [ ] **Step 5: Create references/standards-generic.md (Portable variant)**

Professional document styling for any project:
- Code blocks: Standard markdown with language hints
- Typography: System sans-serif body, monospace for code/data
- Hierarchy: Font size ratio 1:1.25:1.5 (body:H3:H2)
- Whitespace: 1.5x line height for body, 2x gap between sections
- Tables: Left-aligned text, right-aligned numbers, minimal borders
- Prose-first: Default to paragraphs, bullets only for genuinely unordered items

- [ ] **Step 6: Create 4 template files**

`assets/templates/scientific-luxury/technical-spec.md`:
```markdown
# [Feature Name] — Technical Specification

> **Status**: [DRAFT | REVIEW | APPROVED]
> **Date**: DD/MM/YYYY
> **Author**: [Name]

## Problem

[2-3 paragraphs of prose describing the problem. No bullets. Direct language.]

## Approach

[1-2 paragraphs on the chosen approach and why it was selected over alternatives.]

## Design

### [Component 1]

[Prose description of the component's responsibility and interface.]

### [Component 2]

[Prose description.]

## Implementation

| Task | Owner | Files | Status |
|------|-------|-------|--------|
| | | | |

## Verification

[How to test this works. Specific commands, expected output.]
```

Create the remaining 3 templates (user-guide SL, technical-spec generic, user-guide generic) following the same approach — prose-first, sentence case headers, no bullets where prose works.

- [ ] **Step 7: Create assets/examples/before-after.md**

Three side-by-side comparisons:

**Example 1: Bullet wall → Prose**
- Before: 8-item bullet list describing a login flow
- After: 2-paragraph prose description of the same flow

**Example 2: Header spam → Appropriate hierarchy**
- Before: H2 → H3 → H4 → H5 for a simple concept
- After: H2 with prose paragraphs (no sub-headings needed)

**Example 3: AI prose → Direct writing**
- Before: "Let's dive into the comprehensive overview of our authentication system. It's worth noting that..."
- After: "The authentication system uses JWT tokens stored in HTTP-only cookies."

- [ ] **Step 8: Verify golden example structure**

```bash
find .skills/custom/document-formatting-uplift -type f | sort
```

Expected output:
```
.skills/custom/document-formatting-uplift/SKILL.md
.skills/custom/document-formatting-uplift/assets/examples/before-after.md
.skills/custom/document-formatting-uplift/assets/templates/generic/technical-spec.md
.skills/custom/document-formatting-uplift/assets/templates/generic/user-guide.md
.skills/custom/document-formatting-uplift/assets/templates/scientific-luxury/technical-spec.md
.skills/custom/document-formatting-uplift/assets/templates/scientific-luxury/user-guide.md
.skills/custom/document-formatting-uplift/references/anti-patterns.md
.skills/custom/document-formatting-uplift/references/standards-generic.md
.skills/custom/document-formatting-uplift/references/standards.md
```

- [ ] **Step 9: Commit golden example**

```bash
git add .skills/custom/document-formatting-uplift/
git commit -m "feat(skills): add document-formatting-uplift — golden example for Capability Uplift pattern"
```

---

## Task 2: `data-visualisation-uplift` (Replicate Golden Example)

**Files:** Same directory structure as Task 1, under `.skills/custom/data-visualisation-uplift/`

Follow the golden example pattern exactly. Key differences:

- [ ] **Step 1: Create directory structure** (same as Task 1)

- [ ] **Step 2: Create SKILL.md**

Frontmatter: `id: data-visualisation-uplift`, `type: rigid`, triggers: "chart", "graph", "visualisation", "dashboard data", "metrics", "Recharts", "Chart.js", "plot", "data display"

Sections: When to Apply, Banned Defaults (8 from spec lines 110-118), Replacement Standards (spectral palette for data semantics, OLED backgrounds, annotation-first), Chart Archetypes (line, bar, area, metric-card), en-AU, Eval Criteria.

- [ ] **Step 3: Create references/anti-patterns.md** — 8 bad defaults with before/after code examples (Chart.js/Recharts JSX)

- [ ] **Step 4: Create references/standards.md** — SL chart tokens:
  - Background: `#050505`, gridlines: `rgba(255,255,255,0.05)` horizontal only
  - Palette: `{ primary: '#00F5FF', positive: '#00FF88', warning: '#FFB800', negative: '#FF4444', neutral: 'rgba(255,255,255,0.4)' }`
  - Axis labels: JetBrains Mono, `text-xs`, `text-white/60`
  - Tooltip: OLED black bg, single-pixel border, `rounded-sm`

- [ ] **Step 5: Create references/standards-generic.md** — Publication-quality palette (6 colours with WCAG AA contrast on both dark and light backgrounds)

- [ ] **Step 6: Create 4 template files** — Recharts components: LineChart, BarChart, AreaChart, MetricCard (SL + generic variants)

- [ ] **Step 7: Create assets/examples/before-after.md** — 3 comparisons: default Chart.js → SL chart, rainbow palette → spectral, legend-heavy → annotation-first

- [ ] **Step 8: Verify and commit**

```bash
git add .skills/custom/data-visualisation-uplift/
git commit -m "feat(skills): add data-visualisation-uplift — spectral chart aesthetics"
```

---

## Task 3: `diagram-uplift` (Replicate Golden Example)

**Files:** Same directory structure under `.skills/custom/diagram-uplift/`

- [ ] **Step 1: Create directory structure**

- [ ] **Step 2: Create SKILL.md** — Triggers: "diagram", "flowchart", "Mermaid", "architecture diagram", "sequence diagram", "ER diagram", "system diagram", "visualise". 8 banned defaults from spec. Replacement: spectral node colouring, OLED background, subgraph grouping.

- [ ] **Step 3: Create references/anti-patterns.md** — 8 bad Mermaid defaults with before/after

- [ ] **Step 4: Create references/standards.md** — SL Mermaid theme init:
```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#00F5FF', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': 'rgba(255,255,255,0.1)',
  'lineColor': 'rgba(255,255,255,0.3)',
  'secondaryColor': '#00FF88', 'tertiaryColor': '#FFB800',
  'background': '#050505', 'mainBkg': '#0a0a0a',
  'nodeBorder': 'rgba(255,255,255,0.1)',
  'fontFamily': 'JetBrains Mono, monospace',
  'fontSize': '14px'
}}}%%
```
Node colour mapping: data=Cyan, success/output=Emerald, decision/warning=Amber, error/failure=Red, external/integration=Magenta.

- [ ] **Step 5: Create references/standards-generic.md** — Professional dark-mode diagram palette

- [ ] **Step 6: Create 4 templates** — architecture, flow, sequence, ER diagram (SL + generic)

- [ ] **Step 7: Create examples/before-after.md** — Default Mermaid → SL themed

- [ ] **Step 8: Verify and commit**

```bash
git add .skills/custom/diagram-uplift/
git commit -m "feat(skills): add diagram-uplift — spectral Mermaid theming"
```

---

## Task 4: `code-output-uplift` (Replicate Golden Example)

**Files:** Same directory structure under `.skills/custom/code-output-uplift/`

- [ ] **Step 1: Create directory structure**

- [ ] **Step 2: Create SKILL.md** — Triggers: "code quality", "naming conventions", "clean code", "code style", "variable naming", "code review", "refactor for quality". 12 banned defaults from spec. Priority: after council-of-logic, before execution-guardian.

- [ ] **Step 3: Create references/anti-patterns.md** — 12 code anti-patterns with before/after:
  - `const data = await fetch(...)` → `const userProfile = await fetchUserProfile(...)`
  - `// increment counter\ni++` → `i++` (no comment needed)
  - `function processData(data: any)` → `function calculateNutrientTotals(entries: DiaryEntry[]): NutrientSummary`

- [ ] **Step 4: Create references/standards.md** — SL naming conventions from project:
  - React: PascalCase.tsx, hooks: use{Domain}{Action}.ts
  - Backend: snake_case.py, routes: {domain}.py
  - Tests: {component}.test.tsx / test_{module}.py
  - Variables: domain-specific (`agentExecutionResult`, `nutritionEntry`, not `data`, `result`)

- [ ] **Step 5: Create references/standards-generic.md** — Universal clean-code patterns

- [ ] **Step 6: Create 3 templates** — React component, FastAPI route, test file (SL + generic)

- [ ] **Step 7: Create examples/before-after.md** — Generic → domain-specific naming, over-commented → clean, `any` → typed

- [ ] **Step 8: Verify and commit**

```bash
git add .skills/custom/code-output-uplift/
git commit -m "feat(skills): add code-output-uplift — domain-specific naming enforcement"
```

---

## Task 5: Transform `frontend-specialist` Agent

**Files:**
- Modify: `.claude/agents/frontend-specialist/agent.md`

- [ ] **Step 1: Read current agent file fully**

- [ ] **Step 2: Consolidate existing "Never" section with new "Banned Defaults" table**

Replace the existing "Never" section (lines ~111-118) with the expanded Banned Defaults table from the spec (10 items). Deduplicate — items 1, 3, 10 already exist. The new section replaces, not duplicates.

- [ ] **Step 3: Add "Reference Components" section**

Add 5 reference component descriptions (SpectralButton, DataCard, DataTable, Modal, FormField) with key props and Scientific Luxury compliance notes.

- [ ] **Step 4: Add "Self-Verification Gate" section**

Add the checklist from spec lines 225-230.

- [ ] **Step 5: Update version** — 1.0.0 → 1.1.0, modified date → 26/03/2026

- [ ] **Step 6: Commit**

```bash
git add .claude/agents/frontend-specialist/agent.md
git commit -m "feat(agents): uplift frontend-specialist — banned defaults + reference components"
```

---

## Task 6: Implement `docs-writer` Agent

**Files:**
- Modify: `.claude/agents/docs-writer/agent.md` (full replacement of stub)

- [ ] **Step 1: Read current stub**

- [ ] **Step 2: Replace with full implementation**

Use the agent definition from spec lines 239-280. Include:
- Frontmatter: version 1.0.0, role: "Technical Documentation Specialist", status: active, token_budget: 40000
- Core Responsibilities (5 items)
- Banned Defaults table (8 items)
- Document Archetypes — reference document-formatting-uplift templates
- Verification Gate checklist
- Relationship to Other Agents table (orchestrator, frontend-specialist, code-reviewer)

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/docs-writer/agent.md
git commit -m "feat(agents): implement docs-writer — Capability Uplift standards"
```

---

## Task 7: Implement `code-reviewer` Agent

**Files:**
- Modify: `.claude/agents/code-reviewer/agent.md` (full replacement of stub)

- [ ] **Step 1: Read current stub**

- [ ] **Step 2: Replace with full implementation**

Use the agent definition from spec lines 288-343. Include:
- Frontmatter: version 1.0.0, role: "Code Review Specialist", status: active, token_budget: 50000
- Core Responsibilities (5 items)
- Review Checklist — 10 TypeScript + 10 Python items
- Severity Classification table
- Verification Gate checklist
- Relationship to Other Agents table

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/code-reviewer/agent.md
git commit -m "feat(agents): implement code-reviewer — 20-item review checklist"
```

---

## Task 8: Retrofit Batch 1 — Design Domain (5 skills)

**Skills**: scientific-luxury, visual-excellence-enforcer, xaem-theme-ui, blueprint-first, dashboard-patterns

For EACH skill, create `references/` and `assets/` directories following the standard. Read the existing SKILL.md first to extract anti-patterns and standards.

- [ ] **Step 1: scientific-luxury** — Create `references/anti-patterns.md` (extract from "Banned Elements" table), `references/standards.md` (reference existing colour/typography sections), `references/standards-generic.md` (premium design without SL specifics), `assets/templates/scientific-luxury/` (Button, Card, Layout component starters), `assets/templates/generic/` (same without spectral colours), `assets/examples/before-after.md` (Bootstrap → SL comparison)

- [ ] **Step 2: visual-excellence-enforcer** — Create `references/anti-patterns.md` (extract from "Design Audit Checklist"), `references/standards.md` (scoring rubric definitions), `references/standards-generic.md`, `assets/templates/` (audit report template SL + generic), `assets/examples/before-after.md`

- [ ] **Step 3: xaem-theme-ui** — Create `references/anti-patterns.md` (extract banned patterns), `references/standards.md` (theme preset configs), `references/standards-generic.md`, `assets/templates/` (4 theme presets + generic starter), `assets/examples/before-after.md`

- [ ] **Step 4: blueprint-first** — Create `references/anti-patterns.md` (skeleton-code-generator ban), `references/standards.md` (ASCII drawing standards), `references/standards-generic.md`, `assets/templates/` (6 ASCII layout types: landing, dashboard, form, list, detail, settings), `assets/examples/before-after.md`

- [ ] **Step 5: dashboard-patterns** — Create `references/anti-patterns.md` (grid/CSS-transition bans), `references/standards.md` (component library reference), `references/standards-generic.md`, `assets/templates/` (dashboard page SL + generic), `assets/examples/before-after.md`

- [ ] **Step 6: Commit batch**

```bash
git add .skills/custom/scientific-luxury/references/ .skills/custom/scientific-luxury/assets/
git add .skills/custom/visual-excellence-enforcer/references/ .skills/custom/visual-excellence-enforcer/assets/
git add .skills/custom/xaem-theme-ui/references/ .skills/custom/xaem-theme-ui/assets/
git add .skills/custom/blueprint-first/references/ .skills/custom/blueprint-first/assets/
git add .skills/custom/dashboard-patterns/references/ .skills/custom/dashboard-patterns/assets/
git commit -m "feat(skills): retrofit design domain skills with Capability Uplift references"
```

---

## Task 9: Retrofit Batch 2 — Infrastructure Domain (5 skills)

**Skills**: structured-logging, error-taxonomy, health-check, status-page, email-template

Same pattern as Task 8. For each skill, read SKILL.md, extract anti-patterns, create reference + asset directories.

- [ ] **Step 1: structured-logging** — `references/anti-patterns.md` (5 banned logging patterns), `references/standards.md` (structlog format, correlation IDs), `references/standards-generic.md`, `assets/templates/` (Python logger + TS logger setup), `assets/examples/before-after.md`

- [ ] **Step 2: error-taxonomy** — `references/anti-patterns.md` (4 banned error patterns), `references/standards.md` (error code registry), `references/standards-generic.md`, `assets/templates/` (ErrorResponse model + handler), `assets/examples/before-after.md`

- [ ] **Step 3: health-check** — `references/anti-patterns.md` (6 banned patterns), `references/standards.md` (three-tier architecture), `references/standards-generic.md`, `assets/templates/` (liveness/readiness/deep endpoints), `assets/examples/before-after.md`

- [ ] **Step 4: status-page** — `references/anti-patterns.md` (6 anti-patterns), `references/standards.md` (status model + incident model), `references/standards-generic.md`, `assets/templates/` (status page React component + API), `assets/examples/before-after.md`

- [ ] **Step 5: email-template** — `references/anti-patterns.md` (6 banned patterns), `references/standards.md` (React Email + Resend OLED dark), `references/standards-generic.md`, `assets/templates/` (5 email types: welcome, reset, report, alert, invoice), `assets/examples/before-after.md`

- [ ] **Step 6: Commit batch**

```bash
git add .skills/custom/structured-logging/references/ .skills/custom/structured-logging/assets/
git add .skills/custom/error-taxonomy/references/ .skills/custom/error-taxonomy/assets/
git add .skills/custom/health-check/references/ .skills/custom/health-check/assets/
git add .skills/custom/status-page/references/ .skills/custom/status-page/assets/
git add .skills/custom/email-template/references/ .skills/custom/email-template/assets/
git commit -m "feat(skills): retrofit infrastructure domain skills with Capability Uplift references"
```

---

## Task 10: Retrofit Batch 3 — Process Domain (3 skills)

**Skills**: execution-guardian, report-generator, changelog-generator

**Note**: execution-guardian already has `references/error-format.md` — preserve it, add new files alongside.

- [ ] **Step 1: execution-guardian** — Add `references/anti-patterns.md` (risk operation types), `references/standards.md` (risk scoring formulas), `references/standards-generic.md`, `assets/templates/` (gate config templates). Preserve existing `references/error-format.md`.

- [ ] **Step 2: report-generator** — `references/anti-patterns.md` ("guessed scores" ban), `references/standards.md` (report composition rules), `references/standards-generic.md`, `assets/templates/` (JSON, Markdown, HTML report templates), `assets/examples/before-after.md`

- [ ] **Step 3: changelog-generator** — `references/anti-patterns.md` (manual update ban), `references/standards.md` (commit type → section mapping), `references/standards-generic.md`, `assets/templates/` (.versionrc.json, CI workflow), `assets/examples/before-after.md`

- [ ] **Step 4: Commit batch**

```bash
git add .skills/custom/execution-guardian/references/ .skills/custom/execution-guardian/assets/
git add .skills/custom/report-generator/references/ .skills/custom/report-generator/assets/
git add .skills/custom/changelog-generator/references/ .skills/custom/changelog-generator/assets/
git commit -m "feat(skills): retrofit process domain skills with Capability Uplift references"
```

---

## Task 11: Update AGENTS.md Registry

**Files:**
- Modify: `.skills/AGENTS.md`

- [ ] **Step 1: Add 4 new skills to the Custom Skills table**

Add rows for: document-formatting-uplift, data-visualisation-uplift, diagram-uplift, code-output-uplift. Each with description and trigger phrases from their SKILL.md.

- [ ] **Step 2: Update Skill Priority list**

Insert new skills at their designated positions:
- code-output-uplift: after #3 (council-of-logic), before #4 (execution-guardian)
- document-formatting-uplift: after #5 (system-supervisor), before #6 (skill-manager)
- data-visualisation-uplift: after dashboard-patterns
- diagram-uplift: after blueprint-first

- [ ] **Step 3: Update skill count and gap section**

Update "All 61 skills" to reflect the new total (65).

- [ ] **Step 4: Commit**

```bash
git add .skills/AGENTS.md
git commit -m "docs(skills): register 4 new Capability Uplift skills in AGENTS.md"
```

---

## Execution Strategy

**Tasks 1** must complete first (golden example validates the pattern).
**Tasks 2-4** can run in parallel (3 new skills, independent).
**Tasks 5-7** can run in parallel (3 agent transforms, independent).
**Tasks 8-10** can run in parallel (3 retrofit batches, independent).
**Task 11** runs last (registry update after all skills exist).

```
Task 1 (golden example)
    ├── Task 2 (data-vis)  ──┐
    ├── Task 3 (diagram)   ──┼── parallel
    └── Task 4 (code)      ──┘
         ├── Task 5 (frontend-specialist)  ──┐
         ├── Task 6 (docs-writer)          ──┼── parallel
         └── Task 7 (code-reviewer)        ──┘
              ├── Task 8 (retrofit batch 1)  ──┐
              ├── Task 9 (retrofit batch 2)  ──┼── parallel
              └── Task 10 (retrofit batch 3) ──┘
                   └── Task 11 (registry update)
```
