# Generic Design Audit Standards

> Portable design audit criteria for any project. No project-specific branding or colour references.

---

## Scoring Rubric

### Criteria

| Criterion           | Weight | Description                                                                    |
| ------------------- | ------ | ------------------------------------------------------------------------------ |
| **Design Quality**  | 30%    | Coherent visual system — consistent tokens, palette, borders, typography       |
| **Originality**     | 25%    | Custom layout decisions, avoidance of template defaults, unique patterns       |
| **Craft**           | 25%    | Typography precision, spacing rhythm, colour harmony, animation quality        |
| **Functionality**   | 20%    | Usability, task completion, loading/error/empty states, responsive behaviour   |

### Scale

| Score | Description                                              |
| ----- | -------------------------------------------------------- |
| 5     | Exemplary — distinctive design, zero generic patterns    |
| 4     | Strong execution with minor polish needed                |
| 3     | Competent but lacks distinction from defaults            |
| 2     | Partially customised template                            |
| 1     | Framework defaults — no design system applied            |

---

## Design Quality Checklist

- [ ] Consistent background colour across all surfaces
- [ ] Unified border style (width, colour, radius)
- [ ] Limited colour palette (4-6 colours with semantic meaning)
- [ ] Consistent typography across component types
- [ ] Animation library used consistently (not mixed CSS + JS)
- [ ] Shadow style consistent or intentionally absent

---

## Originality Checklist

- [ ] Layouts are not copy-paste from framework docs
- [ ] No 3-column equal card rows (most generic pattern)
- [ ] Custom component patterns rather than default library exports
- [ ] Content uses real copy, not placeholder text
- [ ] Empty states are designed, not just "No data"
- [ ] Navigation pattern suits the application (not generic top navbar by default)

---

## Craft Checklist

### Typography

- [ ] 3+ distinct weight levels for hierarchy (not just 400 and 700)
- [ ] Tracking (letter-spacing) varies by element type
- [ ] Body text width limited to ~65 characters
- [ ] Numbers use monospace or `tabular-nums` alignment
- [ ] No orphaned words on last line (`text-wrap: balance`)

### Spacing

- [ ] Consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
- [ ] Generous whitespace — content breathes
- [ ] Optical alignment adjustments where mathematical centering looks wrong

### Colour

- [ ] All text meets WCAG AA contrast ratio (4.5:1 for normal text)
- [ ] Consistent warm OR cool tones (not mixed)
- [ ] No more than 1 accent colour family
- [ ] Shadows tinted to match background hue

### Animation

- [ ] Physics-based easing (not `linear` or default `ease`)
- [ ] Staggered entry for list items
- [ ] Consistent duration scale across the application
- [ ] No janky motion (layout shift, width/height animation)

---

## Functionality Checklist

### Interactivity

- [ ] Hover states on all interactive elements
- [ ] Active/pressed feedback (scale or translate)
- [ ] Visible focus ring for keyboard navigation
- [ ] Disabled state clearly distinguishable

### States

- [ ] Loading state: skeleton loaders matching final layout
- [ ] Empty state: designed view with guidance
- [ ] Error state: inline feedback (not alerts/modals)
- [ ] Success state: clear confirmation

### Responsive

- [ ] Desktop layout (1024px+)
- [ ] Tablet adaptation (768-1023px)
- [ ] Mobile adaptation (<768px)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] `min-h-[100dvh]` instead of `h-screen`

---

## Audit Report Format

```
DESIGN AUDIT REPORT
═══════════════════════════════════════════════════
Component: [name]
Date: [date]

RULE CHECKS
─────────────────
[PASS/FAIL] | [rule]: [evidence or violation]

SCORE
─────
Design Quality:  [1-5] × 0.30
Originality:     [1-5] × 0.25
Craft:           [1-5] × 0.25
Functionality:   [1-5] × 0.20
Overall: [percentage]%

STATUS: APPROVED | NEEDS WORK
[Ordered fix list if rejected]
═══════════════════════════════════════════════════
```

---

## Fix Priority

| Priority     | Category                          | Fix Approach                    |
| ------------ | --------------------------------- | ------------------------------- |
| **Critical** | Background, borders, animation    | Fix first — foundational        |
| **High**     | Typography, colour, layout        | Fix second — high visual impact |
| **Medium**   | Spacing, opacity, interactions    | Fix third — polish              |
| **Low**      | Minor refinements                 | Fix last — fine-tuning          |

Each fix should be independently committable (atomic).
