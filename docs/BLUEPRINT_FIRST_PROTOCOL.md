# Blueprint First Protocol

> **Mandate**: No code is written for UI, dashboards, architecture, or schemas until an ASCII blueprint
> has been generated, reviewed, and accepted.
>
> This protocol applies to all visual and structural components in NodeJS-Starter-V1.

---

## Why This Exists

Layout disagreements discovered in code cost 10–50× more to fix than the same disagreement
discovered in an ASCII diagram. A blueprint revision takes minutes. A code refactor takes hours.

Blueprint First eliminates this waste at the source.

It also serves non-technical stakeholders: ASCII wireframes communicate layout intent without
requiring the reviewer to read code. A founder can approve a dashboard layout in ASCII
before a single line of JSX is written.

---

## Scope

**Blueprint First applies to**:

| Category            | Examples                                                    |
| ------------------- | ----------------------------------------------------------- |
| Page layouts        | Landing pages, auth pages, onboarding flows, settings pages |
| Dashboards          | Analytics dashboards, admin panels, user dashboards         |
| UI components       | Navigation, data tables, modals, complex forms, card grids  |
| System architecture | Service diagrams, deployment topology, agent workflows      |
| Database schemas    | Table relationships, migration plans, index strategies      |
| Document layouts    | Reports, slide decks, export templates                      |

**Blueprint First does NOT apply to**:

- Small utility functions (no visual output)
- API endpoint logic with no frontend impact
- Bug fixes to existing components (unless layout changes are needed)
- Config file changes
- Unit test additions

---

## The Four-Step Workflow

### Step 1: GENERATE

When a build request is received for a Blueprint First scope item:

1. Do NOT write any code
2. Produce an ASCII blueprint using box-drawing characters
3. Annotate every section with component names
4. Note colour/theme requirements
5. Include responsive variants where applicable

Output format:

```
BLUEPRINT: [Component Name]
Version: 1.0
═══════════════════════════════════════════════════════

[ASCII diagram here]

ANNOTATIONS
  [Section]: [Purpose and behaviour]
  [State notes]: [Loading / Empty / Error states]
  [Colour notes]: [Spectral colours used and where]
  [Responsive notes]: [Mobile behaviour]

═══════════════════════════════════════════════════════
Awaiting approval. Reply "approved" to proceed, or describe changes.
```

---

### Step 2: ITERATE

Present the blueprint to the user. Accept feedback. Revise the blueprint.

**This step repeats until the user approves.**

Approval phrases accepted:

- "approved"
- "looks good"
- "build it"
- "go ahead"
- "that's right"
- "yes, proceed"
- "correct"
- "perfect"

**Do NOT proceed to Step 3 without explicit approval.**

Revision protocol:

- Increment version number (v1.0 → v1.1 → v2.0)
- Show only changed sections with `[CHANGED]` markers
- Preserve approved sections unchanged

---

### Step 3: CONVERT

Once approved, convert the blueprint into an implementation spec.

The spec is the authoritative definition of what will be built. Code must match it exactly.

````markdown
## Implementation Spec: [Component Name]

Blueprint Version: [approved version]
Approved: [DD/MM/YYYY]

### Layout

[Description of layout sections and their relationships]

### Breakpoints

- Desktop (≥1024px): [layout description]
- Tablet (768–1023px): [layout description]
- Mobile (<768px): [layout description]

### Components Required

| Component | File Path | Purpose   |
| --------- | --------- | --------- |
| [Name]    | [path]    | [purpose] |

### Props / Interface

```typescript
interface [Name]Props {
  [prop]: [type]; // [description]
}
```
````

### States

| State   | Trigger        | Visual                       |
| ------- | -------------- | ---------------------------- |
| Default | Initial render | [description]                |
| Loading | Data fetching  | Skeleton (grey pulse)        |
| Empty   | No data        | Empty state component        |
| Error   | Fetch failed   | Spectral Red #FF4444 message |

### Design Tokens

| Element        | Value                              |
| -------------- | ---------------------------------- |
| Background     | OLED Black #050505                 |
| Border         | border-[0.5px] border-white/[0.06] |
| Corner radius  | rounded-sm                         |
| Primary accent | Cyan #00F5FF                       |
| Animation      | Framer Motion only                 |

### Data Flow

- Source: [API endpoint or state]
- Trigger: [user action or lifecycle event]
- Update: [state update mechanism]

### Files to Create

- [path/to/Component.tsx]
- [path/to/Component.types.ts]
- [path/to/Component.hooks.ts]
- [path/to/Component.skeleton.tsx]

### Acceptance Criteria

- [ ] Layout matches blueprint exactly at all three breakpoints
- [ ] All four states implemented (default, loading, empty, error)
- [ ] Animation uses Framer Motion (no CSS transitions)
- [ ] Design tokens applied (no inline colours)
- [ ] TypeScript types complete (no implicit `any`)

```

---

### Step 4: BUILD

With the spec approved:

1. Create files in the order listed in the spec
2. Implement each state before moving to the next component
3. If a deviation from the blueprint is discovered during implementation, **stop and flag it**:

```

BLUEPRINT DEVIATION DETECTED
──────────────────────────────
Expected (from blueprint): [what the blueprint specified]
Actual (implementation constraint): [what is technically required]
Proposed resolution: [option A] or [option B]

Please confirm which resolution to proceed with.

```

4. After implementation, verify the result matches the blueprint
5. Mark spec criteria as complete

---

## ASCII Diagram Standards

### Box-Drawing Characters

```

Single borders: ┌ ─ ┐ │ └ ─ ┘ ├ ┤ ┬ ┴ ┼
Double borders: ╔ ═ ╗ ║ ╚ ═ ╝ ╠ ╣ ╦ ╩ ╬
Arrows: → ← ↑ ↓ ▶ ◀ ▲ ▼
Heavy: ┏ ━ ┓ ┃ ┗ ━ ┛

```

### Annotation Conventions

| Symbol | Meaning |
|--------|---------|
| `*` | Active / selected state |
| `[loading]` | Loading skeleton placeholder |
| `[empty]` | Empty state placeholder |
| `[error]` | Error state placeholder |
| `[CYN]` | Cyan #00F5FF accent |
| `[GRN]` | Emerald #00FF88 accent |
| `[AMB]` | Amber #FFB800 accent |
| `[RED]` | Red #FF4444 accent |
| `[MAG]` | Magenta #FF00FF accent |
| `v1.0` | Version label |
| `CHANGED` | Modified section in revision |

---

## Example: Landing Page Blueprint

**User request**: "Build the landing page"

**Step 1 output**:

```

BLUEPRINT: Landing Page — NodeJS-Starter-V1
Version: 1.0
═══════════════════════════════════════════════════════════════

DESKTOP (≥1024px)
┌──────────────────────────────────────────────────────────┐
│ HEADER [OLED #050505] │
│ ┌─────────────────────┐ ┌──────────────────────────┐ │
│ │ Logo + Project Name│ │ Docs GitHub [Get Started]│ │
│ └─────────────────────┘ └──────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ HERO │
│ │
│ Next.js 15 + FastAPI + PostgreSQL │
│ [H1 — Editorial New font] │
│ │
│ Self-contained AI starter template. │
│ Everything runs locally in Docker. │
│ │
│ [Get Started — CYN border btn] [View on GitHub] │
│ │
├──────────────────────────────────────────────────────────┤
│ FEATURES (3-column grid) │
│ ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ ⚡ Zero Barriers │ │ 🔒 Auth Ready │ │ 🤖 AI Built-in│ │
│ │ │ │ │ │ │ │
│ │ No API keys. │ │ JWT auth + │ │ LangGraph │ │
│ │ No accounts. │ │ bcrypt out │ │ agents + │ │
│ │ Just clone + run.│ │ of the box. │ │ Ollama local.│ │
│ └──────────────────┘ └──────────────┘ └──────────────┘ │
├──────────────────────────────────────────────────────────┤
│ QUICK START (terminal block) │
│ ┌──────────────────────────────────────────────────┐ │
│ │ $ git clone ... │ │
│ │ $ pnpm install │ │
│ │ $ pnpm run setup │ │
│ │ $ pnpm dev [CYN text on dark] │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

MOBILE (<768px) — Stacked layout
Header: Logo left, hamburger right
Hero: Same content, centred, smaller H1
Features: Single column (3 stacked cards)
Quick Start: Full width, horizontal scroll

COLOUR NOTES
Background: OLED Black #050505
Feature card borders: border-[0.5px] border-white/[0.06]
CTA border: Cyan #00F5FF
Terminal text: Cyan #00F5FF
All corners: rounded-sm

═══════════════════════════════════════════════════════════
Version 1.0 — Awaiting approval.
Reply "approved" to generate implementation spec, or describe changes.

```

---

## Relationship to Other Systems

| System | Relationship |
|--------|-------------|
| `outcome-translator` skill | Invokes Blueprint First during build phases of execution plan |
| Council of Logic | Von Neumann architecture review occurs during Step 3 (Convert) |
| `genesis-orchestrator` skill | Blueprint First is the TITAN_DESIGN activation pathway |
| Design System (`docs/DESIGN_SYSTEM.md`) | All blueprints must comply — OLED Black, `rounded-sm`, spectral colours |
| CLI Control Plane | Blueprint First maps to BUILD mode governance |

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 06/03/2026 | Initial protocol definition |
```
