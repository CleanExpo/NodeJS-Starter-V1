# Generic Wireframing Standards

> Portable ASCII wireframing standards for any project. No project-specific design system references.

---

## Purpose

ASCII wireframing before coding eliminates:

- Layout disagreements discovered after implementation
- Dead code from abandoned layout attempts
- Revision cycles that waste development time
- Miscommunication between technical and non-technical stakeholders

---

## Box-Drawing Characters

### Essential Set

| Character | Usage |
|-----------|-------|
| `┌ ┐ └ ┘` | Container corners |
| `│` | Vertical borders |
| `─` | Horizontal borders |
| `├ ┤` | Row separators |
| `┬ ┴` | Column separators |
| `┼` | Grid intersections |

### Flow Arrows

| Character | Meaning |
|-----------|---------|
| `→` | Data/flow moves right |
| `←` | Data/flow moves left |
| `▼` | Data/flow moves down |
| `▲` | Data/flow moves up |

---

## Annotation Rules

### 1. Label Every Section

Use UPPERCASE labels for major layout areas:

```
┌──────────────────────────┐
│  NAVIGATION               │
├──────────────────────────┤
│  MAIN CONTENT             │
├──────────────────────────┤
│  FOOTER                   │
└──────────────────────────┘
```

### 2. Mark Interactive States

```
│  Menu Item 1    │
│  Menu Item 2*   │   ← * = currently active
│  Menu Item 3    │
```

### 3. Show Content Types

```
│  H1: [Page Title]                    │
│  p:  [Description — 2 lines max]     │
│  [Primary Button]  [Secondary Link]  │
```

### 4. Include Responsive Variants

Show how the layout adapts to different screen sizes:

```
DESKTOP (>= 1024px)
┌─────────┬──────────────────┐
│ SIDEBAR │ MAIN CONTENT     │
└─────────┴──────────────────┘

MOBILE (< 768px)
┌────────────────────────────┐
│ MAIN CONTENT               │
├────────────────────────────┤
│ BOTTOM TAB BAR             │
└────────────────────────────┘
```

---

## Common Layout Patterns

### Landing Page

```
┌──────────────────────────────────┐
│  NAVBAR                           │
├──────────────────────────────────┤
│  HERO                             │
│  [Headline + CTA]                 │
├──────────────────────────────────┤
│  FEATURES                         │
│  [Feature grid or list]           │
├──────────────────────────────────┤
│  SOCIAL PROOF                     │
│  [Testimonials or logos]          │
├──────────────────────────────────┤
│  CTA SECTION                      │
│  [Final call to action]           │
├──────────────────────────────────┤
│  FOOTER                           │
└──────────────────────────────────┘
```

### Dashboard

```
┌──────────┬───────────────────────┐
│  SIDEBAR │  HEADER               │
│          ├───────────────────────┤
│  Nav     │  METRICS ROW          │
│  Items   ├───────────────────────┤
│          │  PRIMARY CONTENT      │
│          │  [Chart / Table]      │
│          ├───────────────────────┤
│          │  SECONDARY CONTENT    │
└──────────┴───────────────────────┘
```

### Form Page

```
┌──────────────────────────────────┐
│  NAVBAR                           │
├──────────────────────────────────┤
│  FORM CONTAINER (centred)         │
│  ┌────────────────────────────┐  │
│  │  H2: [Form Title]          │  │
│  │  p:  [Description]         │  │
│  │  ┌──────────────────────┐  │  │
│  │  │  Field 1 [label]     │  │  │
│  │  │  Field 2 [label]     │  │  │
│  │  │  Field 3 [label]     │  │  │
│  │  └──────────────────────┘  │  │
│  │  [Submit Button]           │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

## Workflow

1. **Generate** — Create ASCII blueprint from requirements
2. **Review** — Present to stakeholder, collect feedback
3. **Iterate** — Revise blueprint until approved
4. **Spec** — Convert blueprint to implementation specification
5. **Build** — Write code matching the spec

Never skip steps 2-3. The entire value of this approach comes from reaching alignment before code is written.

---

## Implementation Spec Format

After blueprint approval:

```markdown
## Spec: [Component Name]

### Layout
- [Derived from blueprint]

### Components
- [List components with purposes]

### States
- Default / Loading / Empty / Error

### Data
- Source: [API endpoint or prop]
- Trigger: [mount / event / interval]

### Files
- [path/to/Component.tsx]
```
