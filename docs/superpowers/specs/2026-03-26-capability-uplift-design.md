# Capability Uplift Overhaul — Design Specification

> **Date**: 26/03/2026
> **Status**: Approved
> **Scope**: 4 new uplift skills + 3 agent transforms + 13 skill retrofits

## Context

LLMs have deeply ingrained default patterns — generic layouts, predictable colour schemes, bullet-heavy formatting, stock diagram styles, generic variable names. A **Capability Uplift Skill** overrides and replaces these baked-in defaults with superior alternatives at execution time.

The NodeJS-Starter-V1 framework audit sampled 17 representative skills (13 output-shaping + slop-prevention, 3 agents, 1 external reference). Of those, 13 already follow the four-step Capability Uplift pattern. The remaining 72 skills in `.skills/custom/` are domain-specific utilities (queue-worker, rate-limiter, etc.) that do not shape output quality and are not candidates for uplift retrofit. The 13 retrofitted skills are specifically those with "Banned Elements" or "Anti-Patterns" sections — they already enforce defaults and benefit from the reference asset layer.

## Approach

**Golden Example → Replicate**: Build one exemplar skill (document-formatting-uplift) with full directory structure, validate it, then replicate the pattern across all remaining work.

## Directory Standard

Every uplift skill follows this structure:

```
.skills/custom/{skill-name}/
├── SKILL.md                          # Core instructions + anti-patterns + triggers
├── references/
│   ├── anti-patterns.md              # Explicit bad default catalogue
│   ├── standards.md                  # Scientific Luxury replacement standards
│   └── standards-generic.md          # Framework-agnostic portable standards
├── assets/
│   ├── templates/
│   │   ├── scientific-luxury/        # Project-specific templates
│   │   └── generic/                  # Portable templates
│   └── examples/
│       └── before-after.md           # Bad → good comparisons
└── scripts/                          # Optional: validation scripts
```

**Key rule**: SKILL.md stays lean (triggers + rules). Heavy content in `references/` and `assets/` loaded on demand.

---

## Phase 1: Golden Example — Document Formatting Uplift

### Skill: `document-formatting-uplift`

**Problem**: Wall of bullets, header spam, AI prose tells, flat structure, no typographic hierarchy.

**SKILL.md sections**:

1. Banned Defaults (12 anti-patterns)
2. Replacement Standards (prose-first hierarchy, intentional whitespace)
3. Document Archetypes (5 templates: Technical Spec, User Guide, Report, Proposal, README)
4. en-AU Enforcement
5. Eval Criteria (PASS/FAIL checklist)

**Frontmatter**:

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

**Triggers**: "write a document", "write a report", "write a guide", "format document", "README", "specification", "proposal", "documentation style", "technical writing", "formatting"

> **Note**: "write" alone is intentionally excluded — too broad, conflicts with code-writing tasks. Trigger only on "write a [document type]".

**Banned defaults (12)**:

1. Wall of bullets when prose is more appropriate
2. H2 → H3 → H4 nesting for things that should be one paragraph
3. Starting every section with a summary sentence that restates the heading
4. "Let's dive in", "Here's a comprehensive overview", "In conclusion"
5. "It's worth noting", "It's important to mention", "As we can see"
6. Every list item starting with bold text followed by a dash
7. Overuse of "Key" as a prefix ("Key features", "Key benefits", "Key takeaways")
8. Three-column comparison tables for things that should be prose
9. Exclamation marks in technical documentation
10. Generic section ordering (Overview → Features → Getting Started → API → FAQ)
11. Emoji in headers or bullet points
12. Code blocks for non-code content (using backticks for emphasis instead of proper formatting)

**Reference files**:

- `references/anti-patterns.md` — Full catalogue with before/after for each of the 12 patterns
- `references/standards.md` — Scientific Luxury document style: OLED-themed code blocks, spectral colour for status annotations, JetBrains Mono for data/metrics, Editorial New for titles
- `references/standards-generic.md` — Professional style: clean typography, prose-first, system fonts, works in any project
- `assets/templates/scientific-luxury/technical-spec.md` — Spec template with SL styling
- `assets/templates/scientific-luxury/user-guide.md` — Guide template with SL styling
- `assets/templates/generic/technical-spec.md` — Portable spec template
- `assets/templates/generic/user-guide.md` — Portable guide template
- `assets/examples/before-after.md` — 3 side-by-side comparisons

---

## Phase 2: Remaining New Uplift Skills (3)

### Skill: `data-visualisation-uplift`

**Problem**: Default Chart.js/Recharts — grey gridlines, oversized legends, rainbow palettes, unlabelled axes, poor OLED contrast.

**Banned defaults (8)**:

1. Default grey gridlines on white background
2. Pie charts for > 4 segments
3. Rainbow/categorical colour palettes
4. Legends larger than the chart area
5. Axes labelled "Value" and "Label"
6. Default Chart.js tooltip styling
7. Equal-weight gridlines in both directions
8. Bar charts with > 8 categories (use horizontal bars)

**Replacement standard**: Spectral palette mapped to data semantics (Cyan=primary, Emerald=positive, Amber=warning, Red=negative). Horizontal gridlines only at `white/5` opacity on OLED black. Annotation-first (data labels on chart, not in legend). Responsive sizing.

**Triggers**: "chart", "graph", "visualisation", "dashboard data", "metrics", "Recharts", "Chart.js", "plot", "data display"

**Reference files**:

- `references/anti-patterns.md` — 8 bad defaults with screenshots/code
- `references/standards.md` — SL chart tokens (spectral palette, OLED backgrounds, JetBrains Mono axes)
- `references/standards-generic.md` — Publication-quality palette (6 colours, WCAG AA contrast, dark + light variants)
- `assets/templates/scientific-luxury/` — line-chart, bar-chart, area-chart, metric-card Recharts components
- `assets/templates/generic/` — Same 4 without spectral colours

### Skill: `diagram-uplift`

**Problem**: Default Mermaid — tiny text, no colour coding, cramped layouts, default arrows, no visual hierarchy.

**Banned defaults (8)**:

1. Default Mermaid `%%{init: {'theme': 'default'}}%%`
2. Grey nodes with black text
3. Single-colour diagrams (all nodes same colour)
4. TD direction for everything (should match content flow)
5. No subgraph grouping for bounded contexts
6. Default arrow styles (no labels, no colour)
7. LR flow for inherently sequential processes
8. Text-heavy nodes (> 4 words per node)

**Replacement standard**: Spectral node colouring by type. OLED black background (`#050505`). Subgraph grouping. Custom Mermaid theme init block with project tokens.

**Triggers**: "diagram", "flowchart", "Mermaid", "architecture diagram", "sequence diagram", "ER diagram", "system diagram", "visualise"

**Reference files**:

- `references/anti-patterns.md` — 8 bad defaults
- `references/standards.md` — SL Mermaid theme init config + node colour mapping
- `references/standards-generic.md` — Professional dark-mode diagram palette
- `assets/templates/` — architecture, flow, sequence, ER diagram templates (SL + generic)

### Skill: `code-output-uplift`

**Problem**: Generic variable names, over-commented obvious code, flat structures, placeholder patterns, American English.

**Banned defaults (12)**:

1. Generic names: `data`, `result`, `response`, `item`, `temp`, `val`, `obj`, `arr`, `str`, `num`
2. Commenting obvious code: `// increment counter`, `// return the value`
3. `console.log` left in production code
4. `any` types without justification
5. American English in user-facing strings
6. Placeholder functions: `// TODO: implement`
7. Dead code (commented-out blocks)
8. Functions > 50 lines without decomposition
9. Deeply nested conditionals (> 3 levels)
10. Magic numbers without named constants
11. Inconsistent naming (camelCase mixed with snake_case in same file)
12. Import-all patterns (`import * as`)

**Replacement standard**: Domain-specific naming. Comments only for WHY. Zero `any`. en-AU strings. Functions < 50 lines. Early returns over nesting. Named constants. Consistent conventions per language (camelCase TS, snake_case Python).

**Triggers**: "code quality", "naming conventions", "clean code", "code style", "variable naming", "code review", "refactor for quality"

> **Note**: "implement", "build", "component" intentionally excluded — conflict with `idea-to-production`, `genesis-orchestrator`, and `scientific-luxury`. This skill activates on quality/style concerns, not task initiation. Priority position: after `council-of-logic` (position 3), before `execution-guardian` (position 4) in AGENTS.md.

**Reference files**:

- `references/anti-patterns.md` — 12 banned defaults with before/after code
- `references/standards.md` — SL naming conventions (project-specific patterns from apps/web and apps/backend)
- `references/standards-generic.md` — Universal clean-code patterns
- `assets/templates/scientific-luxury/` — React component, FastAPI route, test file templates
- `assets/templates/generic/` — Same 3 framework-agnostic

---

## Phase 3: Agent Transforms (3)

### 3A. frontend-specialist — Uplift Enhancement

**Current**: v1.0.0, competent but passive. Receives work, references skills, no active anti-default enforcement.

**Add to existing agent.md** (consolidate with existing "Never" section at lines 111-118 — items 1, 3, 10 below already exist and should be deduplicated, not duplicated):

```markdown
## Banned Defaults (Capability Uplift)

Before producing ANY frontend code, verify output does not contain:

| #   | Banned Pattern                                  | Replacement                                 |
| --- | ----------------------------------------------- | ------------------------------------------- |
| 1   | `rounded-lg`, `rounded-xl`, `rounded-full`      | `rounded-sm` only                           |
| 2   | `bg-white`, `bg-gray-*` backgrounds             | `bg-[#050505]` (OLED Black)                 |
| 3   | CSS transitions (`transition-*`)                | Framer Motion with physics easing           |
| 4   | Inter, Roboto, Arial fonts                      | JetBrains Mono (data), system sans (body)   |
| 5   | `text-blue-500`, `text-purple-*`                | Spectral colours only                       |
| 6   | Symmetrical grid (`grid-cols-2`, `grid-cols-4`) | Asymmetric splits                           |
| 7   | Generic card styling (`shadow-lg`, `border`)    | Single-pixel border, no shadow              |
| 8   | Lucide icons for status                         | Breathing orbs, pulse indicators            |
| 9   | Static hover states                             | `whileHover`/`whileTap` with spring physics |
| 10  | `h-screen`                                      | `min-h-[100dvh]`                            |

## Reference Components

5 production-ready components following Scientific Luxury:

1. **SpectralButton** — Framer Motion tap/hover, spectral colour variants, `rounded-sm`
2. **DataCard** — OLED black, single-pixel border, JetBrains Mono metrics, breathing status orb
3. **DataTable** — Asymmetric columns, spectral row highlights, skeleton loading
4. **Modal** — AnimatePresence mount/unmount, backdrop blur, z-30 overlay
5. **FormField** — Label above, helper text, inline error, en-AU validation messages

## Self-Verification Gate

Before reporting task complete, verify:

- [ ] Zero banned patterns in output
- [ ] All interactive elements have Framer Motion animations
- [ ] OLED black background on all new components
- [ ] Spectral colours only (no arbitrary hex values)
- [ ] en-AU strings in all user-facing text
```

### 3B. docs-writer — Full Implementation

**Current**: Stub v0.1.0.

**New agent.md content** (full replacement):

```markdown
# Docs Writer Agent

Technical documentation specialist. Produces publication-quality documentation
that follows Capability Uplift standards — no wall-of-bullets, no AI prose tells,
no generic formatting.

## Core Responsibilities

1. API endpoint documentation with request/response examples
2. Component documentation with usage patterns
3. Feature guides with step-by-step instructions
4. Architecture documentation with diagrams
5. README and onboarding guides

## Banned Defaults

| #   | Banned                                    | Replacement                     |
| --- | ----------------------------------------- | ------------------------------- |
| 1   | Wall of bullets                           | Prose-first paragraphs          |
| 2   | Header spam (H2→H3→H4 for one idea)       | Appropriate heading depth       |
| 3   | "Let's dive in", "comprehensive overview" | Direct opening sentence         |
| 4   | Lorem Ipsum or placeholder text           | Real draft copy in en-AU        |
| 5   | Generic section ordering                  | Content-appropriate structure   |
| 6   | Exclamation marks in technical docs       | Period or no punctuation        |
| 7   | Title Case On Every Header                | Sentence case                   |
| 8   | Every list item bold+dash                 | Mixed formatting as appropriate |

## Document Archetypes

References document-formatting-uplift skill templates.

## Verification Gate

Before submitting documentation:

- [ ] No AI prose tells detected
- [ ] en-AU spelling throughout
- [ ] DD/MM/YYYY date format
- [ ] Sentence case headers
- [ ] Prose used where bullets are not warranted
- [ ] All code examples tested and runnable
```

### 3C. code-reviewer — Full Implementation

**Current**: Stub v0.1.0.

**New agent.md content** (full replacement):

```markdown
# Code Reviewer Agent

Automated code review specialist. Applies Capability Uplift standards
to detect and reject generic LLM output patterns in code.

## Core Responsibilities

1. Pattern analysis against project conventions
2. Security vulnerability scanning
3. Performance anti-pattern detection
4. Naming quality enforcement
5. Test coverage gap identification

## Review Checklist (20 items)

### TypeScript (10)

1. No `any` types without justification comment
2. No generic variable names (data, result, item, temp)
3. No console.log in production code
4. No CSS transitions (must use Framer Motion)
5. No American English in user-facing strings
6. No functions > 50 lines
7. No deeply nested conditionals (> 3 levels)
8. No magic numbers without named constants
9. No import-all patterns (import \*)
10. No cross-layer imports (components/ ← server/)

### Python (10)

1. Type hints on all public functions
2. No bare except clauses
3. No mutable default arguments
4. No print() statements (use structlog)
5. No American English in user-facing strings
6. No functions > 50 lines
7. No star imports (from module import \*)
8. No unused imports
9. No hardcoded credentials or secrets
10. Docstrings on public classes and functions

## Severity Classification

| Severity | Blocking? | Examples                                                |
| -------- | --------- | ------------------------------------------------------- |
| Critical | Yes       | Security vulnerability, data leak, `any` in public API  |
| High     | Yes       | Cross-layer import, American English, no error handling |
| Medium   | No        | Generic variable name, missing type hint, long function |
| Low      | No        | Minor naming inconsistency, optional optimisation       |

## Verification Gate

Before submitting review:

- [ ] Each finding has file:line reference
- [ ] Each finding has severity classification
- [ ] No false positives on project-approved patterns
- [ ] Review is constructive (includes fix suggestion)
```

---

## Phase 4: Retrofit Existing Skills (13)

For each skill, add `references/` and `assets/` directories. SKILL.md content unchanged.

### Batch 1 — Design Domain (5 skills)

| Skill                      | `references/anti-patterns.md`                  | `references/standards.md`              | `assets/templates/`                          |
| -------------------------- | ---------------------------------------------- | -------------------------------------- | -------------------------------------------- |
| scientific-luxury          | Extract from "Banned Elements" table           | Already comprehensive — reference self | SL component starters (Button, Card, Layout) |
| visual-excellence-enforcer | Extract from "Design Audit Checklist"          | Scoring rubric criteria definitions    | Audit report template (SL + generic)         |
| xaem-theme-ui              | Extract from banned patterns                   | Theme preset configs                   | Theme generation starter (4 presets)         |
| blueprint-first            | Extract "skeleton-code-generator" anti-pattern | ASCII standards reference              | ASCII template library (6 layout types)      |
| dashboard-patterns         | Extract "grid layouts, CSS transitions" bans   | Component library reference            | Dashboard page templates (SL + generic)      |

### Batch 2 — Infrastructure Domain (5 skills)

| Skill              | `references/anti-patterns.md` | `references/standards.md` | `assets/templates/`                  |
| ------------------ | ----------------------------- | ------------------------- | ------------------------------------ |
| structured-logging | Extract 5 banned patterns     | Log format standards      | Logger setup templates (Python + TS) |
| error-taxonomy     | Extract 4 banned patterns     | Error code registry       | Error handling templates             |
| health-check       | Extract 6 banned patterns     | Three-tier architecture   | Health endpoint templates            |
| status-page        | Extract 6 anti-patterns       | Status model standards    | Status page component templates      |
| email-template     | Extract 6 banned patterns     | Email layout standards    | Email templates (5 types)            |

### Batch 3 — Process Domain (3 skills)

| Skill               | `references/anti-patterns.md`                                                                                 | `references/standards.md` | `assets/templates/`           |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------- |
| execution-guardian  | Extract risk operation types (note: `references/error-format.md` already exists — preserve it, add alongside) | Risk scoring formulas     | Gate configuration templates  |
| report-generator    | Extract "guessed scores" ban                                                                                  | Report composition rules  | Report templates (3 formats)  |
| changelog-generator | Extract manual update ban                                                                                     | Commit type mapping       | .versionrc.json + CI workflow |

---

## Implementation Order

1. **Golden example** — Build document-formatting-uplift with full structure, validate
2. **Replicate new skills** — data-visualisation-uplift, diagram-uplift, code-output-uplift (parallel)
3. **Agent transforms** — frontend-specialist enhance, docs-writer implement, code-reviewer implement (parallel)
4. **Retrofit Batch 1** — 5 design domain skills (parallel)
5. **Retrofit Batch 2** — 5 infrastructure domain skills (parallel)
6. **Retrofit Batch 3** — 3 process domain skills (parallel)
7. **Registry update** — Update `.skills/AGENTS.md` with new skills and descriptions

## AGENTS.md Priority Positions (New Skills)

| New Skill                  | Priority Position                                           | Rationale                                            |
| -------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| document-formatting-uplift | After #5 (system-supervisor), before #6 (skill-manager)     | Document quality is a cross-cutting concern          |
| code-output-uplift         | After #3 (council-of-logic), before #4 (execution-guardian) | Code quality gates run before execution governance   |
| data-visualisation-uplift  | After dashboard-patterns, before vector-search              | Domain-specific, activates alongside dashboard work  |
| diagram-uplift             | After blueprint-first, before report-generator              | Diagrams are a sub-concern of blueprints and reports |

## Agent Version Numbers

| Agent               | Current Version | New Version                 |
| ------------------- | --------------- | --------------------------- |
| frontend-specialist | 1.0.0           | 1.1.0 (enhancement)         |
| docs-writer         | 0.1.0 (stub)    | 1.0.0 (full implementation) |
| code-reviewer       | 0.1.0 (stub)    | 1.0.0 (full implementation) |

## Verification

- Each new skill: trigger phrase test (say the trigger, confirm activation)
- Each agent transform: dispatch agent on test task, verify anti-default enforcement
- Each retrofit: confirm `references/` and `assets/` directories exist with content
- Final: run `/harness-review` to confirm component inventory is accurate

## File Count (Approximate)

Counts are estimates — actual totals depend on how many templates each domain requires. All counts are approximate (marked ~).

| Category                       | New Files                                                    | Modified Files |
| ------------------------------ | ------------------------------------------------------------ | -------------- |
| Golden example (Phase 1)       | ~11 (1 SKILL.md + 3 refs + 4 templates + 1 examples + 1 dir) | 0              |
| New uplift skills (Phase 2)    | ~33 (3 skills × ~11 files each)                              | 0              |
| Agent transforms (Phase 3)     | 0                                                            | 3              |
| Retrofit directories (Phase 4) | ~65-80 (13 skills × 5-6 files each)                          | 0              |
| Registry update                | 0                                                            | 1              |
| **Total**                      | **~110-125**                                                 | **4**          |
