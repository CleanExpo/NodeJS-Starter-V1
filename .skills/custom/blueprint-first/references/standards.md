# Blueprint First — ASCII Drawing Standards

> Extracted from `SKILL.md`. Box-drawing characters, annotation rules, and implementation spec format.

---

## Box-Drawing Character Set

### Primary Characters

| Character | Name | Usage |
|-----------|------|-------|
| `┌` | Top-left corner | Start of container |
| `┐` | Top-right corner | End of container top |
| `└` | Bottom-left corner | Start of container bottom |
| `┘` | Bottom-right corner | End of container bottom |
| `│` | Vertical line | Side borders |
| `─` | Horizontal line | Top/bottom borders |
| `├` | Left tee | Row separator (left) |
| `┤` | Right tee | Row separator (right) |
| `┬` | Top tee | Column separator (top) |
| `┴` | Bottom tee | Column separator (bottom) |
| `┼` | Cross | Grid intersection |

### Data Flow Arrows

| Character | Direction | Usage |
|-----------|-----------|-------|
| `→` | Right | Data flows right |
| `←` | Left | Data flows left |
| `▼` | Down | Data flows down |
| `▲` | Up | Data flows up |
| `▶` | Right (filled) | Foreign key reference |
| `◄` | Left (filled) | Reverse reference |

### State Indicators

| Marker | Meaning | Usage |
|--------|---------|-------|
| `*` | Active state | Append to active nav items |
| `[loading]` | Loading state | Placeholder for skeleton |
| `[empty]` | Empty state | No data available |
| `[error]` | Error state | Error condition display |

---

## Annotation Requirements

Every blueprint must include these five annotation types:

### 1. Component Labels

Name every section in UPPERCASE:

```
┌──────────────────────────┐
│  HEADER                   │
├──────────────────────────┤
│  SIDEBAR  │  MAIN CONTENT │
└──────────────────────────┘
```

### 2. State Indicators

Mark interactive and dynamic states:

```
│  Nav Item 1   │
│  Nav Item 2*  │   ← * = active state
│  Nav Item 3   │
```

### 3. Data Flow Arrows

Show where data comes from and goes:

```
┌──────────┐         ┌──────────┐
│  Client  │ ──→──→  │  Server  │
│          │ ←──←──  │          │
└──────────┘         └──────────┘
```

### 4. Responsive Notes

If layout changes on mobile, show the mobile variant:

```
DESKTOP LAYOUT
┌──────────┬───────────────────┐
│ SIDEBAR  │  MAIN CONTENT     │
└──────────┴───────────────────┘

MOBILE LAYOUT (< 768px)
┌───────────────────────────────┐
│  MAIN CONTENT (full width)    │
├───────────────────────────────┤
│  BOTTOM NAV (4 items)         │
└───────────────────────────────┘
```

### 5. Colour/Theme Notes

Reference spectral colours where relevant:

```
COLOUR NOTES
  * = active nav state [CYAN #00F5FF left border]
  [GRN] = Emerald #00FF88 (positive metric)
  [RED] = Red #FF4444 (negative metric)
  All text on OLED Black #050505 background
```

---

## Blueprint Types

### UI / Page Layout

For frontend pages and component layouts:

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                              │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │  Logo + Nav          │  │  Auth CTA            │  │
│  └──────────────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  CONTENT AREA                                        │
└─────────────────────────────────────────────────────┘
```

### System Architecture

For service topology and data flow:

```
┌──────────────┐    ┌──────────────┐
│  Next.js 15  │    │  FastAPI     │
│  apps/web/   ├───►│  apps/backend│
└──────────────┘    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL   │
                    └──────────────┘
```

### Database Schema

For table relationships:

```
┌─────────────────┐        ┌─────────────────┐
│  users          │        │  sessions        │
├─────────────────┤        ├─────────────────┤
│ id     UUID PK  │◄──┐    │ id     UUID PK  │
│ email  TEXT     │   └────│ user_id UUID FK  │
└─────────────────┘        └─────────────────┘
```

---

## Implementation Spec Format

After blueprint approval, generate this spec:

```markdown
## Implementation Spec: [Component Name]

### Layout
- [Description derived from blueprint]
- Breakpoints: [desktop / tablet / mobile behaviour]

### Components Required
- [ComponentA] — [purpose]
- [ComponentB] — [purpose]

### Props / Interface
\`\`\`typescript
interface [ComponentName]Props {
  [prop]: [type]; // [description]
}
\`\`\`

### States
- Default: [description]
- Loading: [skeleton component]
- Empty: [empty state description]
- Error: [spectral Red #FF4444]

### Data Flow
- Source: [where data comes from]
- Trigger: [what causes data fetch]
- Update: [how state is updated]

### Design Tokens
- Background: [#050505]
- Border: [border-[0.5px] border-white/[0.06]]
- Typography: [font + size]
- Animation: [Framer Motion variant]

### Files to Create
- [path/to/Component.tsx]
- [path/to/Component.types.ts]
```

---

## Workflow Summary

```
GENERATE → ITERATE → CONVERT → BUILD
   │          │         │         │
   │          │         │         └─ Write code matching spec exactly
   │          │         └─ Translate blueprint to implementation spec
   │          └─ Present, get feedback, revise until approved
   └─ Produce ASCII blueprint (no code yet)
```
