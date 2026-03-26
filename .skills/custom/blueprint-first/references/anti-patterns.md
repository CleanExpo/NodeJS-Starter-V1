# Blueprint First — Anti-Patterns Reference

> Extracted from `SKILL.md`. The core anti-pattern this skill prevents and common workflow violations.

---

## Anti-Pattern: Code-First (Skeleton Code Generator)

The most common failure mode. Writing code before establishing layout agreement.

### Symptoms

1. **200+ lines of JSX written before layout is confirmed** — revisions cost thousands of tokens
2. **Layout disagreements discovered during code review** — too late, code is already written
3. **Dead code from abandoned layout attempts** — orphaned components, unused props
4. **Non-technical stakeholders cannot review** — code is unreadable to founders/designers

### The Cost

| Approach | Revision Cost | Discovery Point |
|----------|--------------|-----------------|
| Blueprint revision | ~0 tokens of code | Before any code exists |
| Code revision | ~500-2000 tokens | After implementation |
| Post-merge fix | ~1000-5000 tokens | After PR review |

### Example

```
CODE-FIRST (WRONG):
  User: "Build an analytics dashboard"
  Agent: [immediately writes 300 lines of JSX]
  User: "No, I wanted the chart on the left, not the right"
  Agent: [rewrites 200 lines]
  User: "Actually, can we use a timeline instead of cards?"
  Agent: [rewrites 250 lines — third attempt]

BLUEPRINT-FIRST (CORRECT):
  User: "Build an analytics dashboard"
  Agent: [generates ASCII blueprint — 30 lines]
  User: "Move the chart to the left"
  Agent: [revises ASCII blueprint — 2 lines changed]
  User: "approved"
  Agent: [writes code once, matching blueprint exactly]
```

---

## Anti-Pattern: Skipping Approval

Proceeding to code generation without explicit user confirmation.

### Banned

```
Agent: "Here's the blueprint. I'll go ahead and implement it now."
[proceeds to write code without waiting for approval]
```

### Required

```
Agent: "Does this layout match your vision? Reply 'approved' to generate
       the implementation spec, or describe what you'd like changed."
[WAIT for explicit approval phrase before proceeding]
```

### Approval Phrases (accept only these)

- "approved", "looks good", "build it", "go ahead"
- "that's right", "yes", "correct", "perfect"

### Non-Approval Phrases (require revision)

- "not quite", "change X", "move X to Y", "that's wrong"
- Any feedback suggesting revision is needed

---

## Anti-Pattern: Blueprint Without Annotations

Generating ASCII art without component labels, state indicators, or data flow arrows.

### Banned

```
┌──────────────────┐
│                   │
│   ┌────┐ ┌────┐  │
│   │    │ │    │  │
│   └────┘ └────┘  │
│                   │
└──────────────────┘
```

### Required

```
┌──────────────────────────────────────────┐
│  HEADER [OLED BG]                         │
│  ┌──────────────┐  ┌─────────────────┐   │
│  │ Logo + Nav   │  │ User Menu [CYN] │   │
│  └──────────────┘  └─────────────────┘   │
├──────────────────────────────────────────┤
│  HERO                                     │
│  H1: [Primary Headline]                   │
│  p:  [Supporting copy — 2 lines max]      │
│  [CTA Button]                             │
└──────────────────────────────────────────┘

COLOUR NOTES
  [CYN] = Cyan #00F5FF (active state)
  All text on OLED Black #050505
```

### Required Annotations

1. **Component labels** — HEADER, HERO, SIDEBAR, etc.
2. **State indicators** — `*` for active, `[loading]`, `[empty]`, `[error]`
3. **Data flow arrows** — `→`, `←`, `▼`, `▲` for data direction
4. **Responsive notes** — mobile variant shown if layout changes
5. **Colour/theme notes** — spectral colour references where relevant

---

## Anti-Pattern: Applying Blueprint to Wrong Scope

Blueprint First has specific scope boundaries. Applying it where it is unnecessary wastes time.

### Blueprint First APPLIES To

- Page layouts (landing pages, dashboards, settings, onboarding)
- UI components with complex layout (navigation, data tables, modals, forms)
- System architecture diagrams
- Database schemas
- Agent/workflow graphs

### Blueprint First Does NOT Apply To

- Small utility functions with no visual output
- API endpoint logic with no frontend impact
- Bug fixes to existing components (unless layout changes required)
- Config file changes
- Test files

---

## Anti-Pattern: Deviation Without Flagging

Implementing code that differs from the approved blueprint without explicitly calling it out.

### Banned

```
// Blueprint showed sidebar on left, but agent puts it on right
// without mentioning the deviation
<div className="flex flex-row-reverse">
  <main>Content</main>
  <aside>Sidebar</aside>
</div>
```

### Required

```
DEVIATION FROM BLUEPRINT
Blueprint: Sidebar on left
Implementation: Sidebar on right
Reason: [explain why]
Decision needed: Should I match the blueprint or proceed with this change?
```
