---
name: blueprint-first
description: >
  Generate an ASCII wireframe or architecture diagram BEFORE writing any code for UI,
  dashboards, landing pages, system architecture, or database schemas.
  Use when user asks to build any visual or structural component.
triggers:
  - 'build a dashboard'
  - 'create a landing page'
  - 'design the UI'
  - 'add a page'
  - 'build the frontend'
  - 'create the database schema'
  - 'design the architecture'
  - 'build a slide deck'
  - 'create a layout'
  - 'add a screen'
type: rigid
---

# Blueprint First Skill

> **Mandate**: No code is written until an ASCII blueprint has been generated, reviewed, and accepted.
> Dead code and incorrect layouts are eliminated at the planning stage, not the review stage.
>
> **Locale**: en-AU — colour, behaviour, optimisation, organised, licence (noun).

---

## Why Blueprint First

1. **Eliminates dead code**: Layout disagreements are discovered in ASCII, not after 200 lines of JSX
2. **Aligns non-technical stakeholders**: Founders can review ASCII wireframes without reading code
3. **Produces implementation specs**: Accepted blueprints become the authoritative spec for code generation
4. **Reduces revision cycles**: One blueprint iteration costs 0 tokens of code; one code revision costs thousands

This is a **rigid** skill. The workflow must be followed exactly.

---

## Workflow

```
Step 1: GENERATE
  → Produce ASCII blueprint for the requested component
  → No code written yet

Step 2: ITERATE
  → Present blueprint to user
  → Accept feedback and revise blueprint
  → Repeat until user confirms: "approved" / "looks good" / "build it"
  → No code written until explicit approval

Step 3: CONVERT
  → Translate accepted blueprint into an implementation spec
  → Spec includes: components, props, data flow, states, layout constraints

Step 4: BUILD
  → Write code from the spec
  → Code must match the blueprint exactly
  → Flag any deviation from blueprint as a decision point
```

---

## ASCII Blueprint Standards

### UI / Page Layouts

Use box-drawing characters. Always annotate components.

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                              │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │  Logo + Nav          │  │  Auth CTA            │  │
│  └──────────────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  HERO                                                │
│  ┌─────────────────────────────────────────────────┐│
│  │  H1: [Primary Headline]                          ││
│  │  p:  [Supporting copy — 2 lines max]             ││
│  │  [CTA Button]         [Secondary CTA]            ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  FEATURES (3-column grid)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Icon        │ │ Icon        │ │ Icon        │   │
│  │ Feature 1   │ │ Feature 2   │ │ Feature 3   │   │
│  │ description │ │ description │ │ description │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Dashboard Layouts

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR          │  MAIN CONTENT AREA               │
│  ┌─────────────┐  │  ┌─────────────────────────────┐ │
│  │ Nav Item 1  │  │  │  STATS ROW                  │ │
│  │ Nav Item 2  │  │  │  ┌──────┐┌──────┐┌──────┐  │ │
│  │ Nav Item 3  │  │  │  │Stat 1││Stat 2││Stat 3│  │ │
│  │ Nav Item 4* │  │  │  └──────┘└──────┘└──────┘  │ │
│  │             │  │  ├─────────────────────────────┤ │
│  │  [Logout]   │  │  │  DATA TABLE / CHART         │ │
│  └─────────────┘  │  │  [Content area]             │ │
│                   │  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
  * = active state
```

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                             │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │  Next.js 15     │    │  Mobile (future) │              │
│  │  apps/web/      │    │                 │              │
│  └────────┬────────┘    └────────┬────────┘              │
│           │                      │                        │
├───────────▼──────────────────────▼────────────────────────┤
│  API GATEWAY                                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  FastAPI  |  /api/auth  |  /api/agents  |  /api/*  │  │
│  └────────────────────────────┬───────────────────────┘  │
├────────────────────────────────▼──────────────────────────┤
│  SERVICE LAYER                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth Service│  │  AI Agents   │  │  Data Service│   │
│  │  jwt.py      │  │  LangGraph   │  │              │   │
│  └──────────────┘  └──────────────┘  └──────┬───────┘   │
├───────────────────────────────────────────────▼───────────┤
│  DATA LAYER                                               │
│  ┌──────────────────────┐   ┌──────────────────────┐     │
│  │  PostgreSQL           │   │  Redis (cache)       │     │
│  └──────────────────────┘   └──────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### Database Schema

```
┌─────────────────────┐        ┌─────────────────────┐
│  users              │        │  sessions            │
├─────────────────────┤        ├─────────────────────┤
│ id          UUID PK │◄──┐    │ id          UUID PK │
│ email       TEXT    │   │    │ user_id     UUID FK  │──►users.id
│ password    TEXT    │   │    │ token       TEXT     │
│ role        TEXT    │   └────│ expires_at  TIMESTAMP│
│ created_at  TIMESTAMP│        │ created_at  TIMESTAMP│
└─────────────────────┘        └─────────────────────┘
```

---

## Blueprint Annotation Requirements

Every blueprint must include:

1. **Component labels** — name every section (HEADER, HERO, SIDEBAR, etc.)
2. **State indicators** — mark active, hover, empty, loading, error states with `*`, `[loading]`, `[empty]`, `[error]`
3. **Data flow arrows** — use `→`, `←`, `▼`, `▲` for data direction
4. **Responsive notes** — if layout changes on mobile, show mobile variant below
5. **Colour/theme notes** — note spectral colours where relevant (e.g., `[CYAN accent]`, `[OLED background]`)

---

## Implementation Spec Format

After blueprint approval, generate a spec in this format:

````markdown
## Implementation Spec: [Component Name]

### Layout

- [Description of layout derived from blueprint]
- Breakpoints: [desktop / tablet / mobile behaviour]

### Components Required

- [ComponentA] — [purpose]
- [ComponentB] — [purpose]

### Props / Interface

```typescript
interface [ComponentName]Props {
  [prop]: [type]; // [description]
}
```
````

### States

- Default: [description]
- Loading: [description — use Skeleton component]
- Empty: [description]
- Error: [description — use spectral Red #FF4444]

### Data Flow

- Source: [where data comes from]
- Trigger: [what causes data fetch]
- Update: [how state is updated]

### Design Tokens

- Background: [token or hex]
- Border: [token]
- Typography: [font + size]
- Animation: [Framer Motion variant name]

### Files to Create

- [path/to/Component.tsx]
- [path/to/Component.types.ts]
- [path/to/Component.hooks.ts] (if needed)

```

---

## Approval Phrases

The skill waits for explicit approval before proceeding to Step 3 (Convert) and Step 4 (Build).

Accept these as approval:
- "approved"
- "looks good"
- "build it"
- "go ahead"
- "that's right"
- "yes"
- "correct"
- "perfect"

Do NOT proceed if the user says:
- "not quite"
- "change X"
- "move X to Y"
- "that's wrong"
- Any feedback suggesting revision is needed

---

## Scope Boundaries

**Blueprint First applies to**:
- Page layouts (landing pages, dashboards, settings pages, onboarding flows)
- UI components with complex layout (navigation, data tables, modals, forms)
- System architecture diagrams
- Database schemas
- Agent/workflow graphs
- Slide decks or report layouts

**Blueprint First does NOT apply to**:
- Small utility functions with no visual output
- API endpoint logic with no frontend impact
- Bug fixes to existing components (unless the fix requires layout changes)
- Config file changes
- Test files

---

## Integration Points

- **Outcome Translator**: If an outcome plan includes build steps, invoke Blueprint First before each build phase
- **Council of Logic**: Von Neumann architecture review happens during the Convert step (Step 3)
- **Design System**: All blueprints must use `rounded-sm`, OLED Black backgrounds, and spectral colours per `docs/DESIGN_SYSTEM.md`
- **Genesis Hive Mind**: Blueprint First is the `TITAN_DESIGN` activation pathway

---

## Example

**User says**: "Build the analytics dashboard"

**Skill invoked**: blueprint-first

**Step 1 output**:

```

BLUEPRINT: Analytics Dashboard
═══════════════════════════════════════════════════════

DESKTOP LAYOUT
┌─────────────────────────────────────────────────────┐
│ HEADER [OLED BG] │
│ ┌────────────────┐ ┌──────────────────────┐ │
│ │ Logo │ │ User menu [Logout] │ │
│ └────────────────┘ └──────────────────────┘ │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR │ MAIN CONTENT │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ Overview\*│ │Total │ │ MRR │ │ MAU │ │Churn │ │
│ Revenue │ │Users │ │$0.00 │ │ 0 │ │ 0% │ │
│ Users │ │ 0 │ │[GRN] │ │[CYN] │ │[RED] │ │
│ Events │ └──────┘ └──────┘ └──────┘ └──────┘ │
│ Settings │ ┌─────────────────────────────────────┐ │
│ │ │ REVENUE CHART (last 30 days) │ │
│ [v1.0.0] │ │ [Line chart — Framer Motion anim] │ │
│ │ └─────────────────────────────────────┘ │
│ │ ┌─────────────────────────────────────┐ │
│ │ │ RECENT EVENTS TABLE │ │
│ │ │ Date | User | Event | Amount │ │
│ │ │ ────────────────────────────────── │ │
│ │ │ [row] [row] [row] [row] │ │
│ │ │ [Pagination] │ │
│ │ └─────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────┘

COLOUR NOTES

- = active nav state [CYAN #00F5FF left border]
  [GRN] = Emerald #00FF88 (positive metric)
  [CYN] = Cyan #00F5FF (neutral metric)
  [RED] = Red #FF4444 (negative metric)
  All text on OLED Black #050505 background

MOBILE LAYOUT (stacked)
Header → Stats (2-column grid) → Chart → Table (scrollable)
Sidebar collapses to bottom nav bar

═══════════════════════════════════════════════════════
Does this layout match your vision? Reply "approved" to generate the implementation spec,
or describe what you'd like changed.

```

```
