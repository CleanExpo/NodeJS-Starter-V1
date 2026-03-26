# Visual Excellence Enforcer — Scoring Rubric Standards

> Extracted from `SKILL.md` §Scoring Rubric and §Prioritised Remediation. Defines the four weighted criteria for quantitative design assessment.

---

## Scoring Rubric

### Criteria Weights

| Criterion           | Weight | Description                                                                                  |
| ------------------- | ------ | -------------------------------------------------------------------------------------------- |
| **Design Quality**  | 30%    | Coherent visual whole — OLED black, spectral colours, single-pixel borders, JetBrains Mono   |
| **Originality**     | 25%    | Custom layout decisions, avoidance of template defaults, unique component patterns            |
| **Craft**           | 25%    | Typography precision, spacing rhythm, colour harmony, contrast ratios, animation smoothness   |
| **Functionality**   | 20%    | Usability, task completion, loading/error/empty states, responsive behaviour                  |

**Weight rationale**: Design Quality and Originality are weighted higher because Claude already scores well on Craft and Functionality by default.

### Scoring Scale (per criterion)

| Score | Description                                                              |
| ----- | ------------------------------------------------------------------------ |
| 5     | Scientific Luxury exemplar — museum quality, zero AI tells               |
| 4     | Strong execution with minor polish needed                                |
| 3     | Competent dark theme but lacks Scientific Luxury distinction             |
| 2     | Generic template with partial design system compliance                   |
| 1     | Bootstrap/Tailwind defaults — no design system applied                   |

### Overall Score Calculation

```
Overall = (Design Quality × 0.30 + Originality × 0.25 + Craft × 0.25 + Functionality × 0.20) / 5 × 100
```

---

## Design Quality (30%) — Detailed Criteria

| Check | Pass Condition |
|-------|---------------|
| Background | OLED Black `#050505` — not `#000000`, not white, not grey |
| Borders | `border-[0.5px] border-white/[0.06]` — no solid coloured borders |
| Border radius | `rounded-sm` only — no `rounded-lg`, `rounded-xl` |
| Colours | Spectral palette only — no Bootstrap blues, Material greens |
| Typography | JetBrains Mono for data, Editorial New for headings |
| Animations | Framer Motion with physics-based easing — no CSS transitions |
| Shadows | None or subtle glow — no generic `box-shadow` |

---

## Originality (25%) — Detailed Criteria

| Check | Pass Condition |
|-------|---------------|
| Layout | Asymmetric splits, timelines, orbital — no symmetrical card grids |
| Components | Custom patterns (breathing orbs, data strips) — no default shadcn |
| Content | Real copy, organic numbers, diverse names — no AI tells |
| Navigation | Custom sidebar/bottom nav — no generic top navbar |
| Empty states | Composed onboarding view — not "No data found" |

---

## Craft (25%) — Detailed Criteria

| Check | Pass Condition |
|-------|---------------|
| Typography hierarchy | 3+ weight levels (200, 300, 400, 500) with tracking variation |
| Spacing rhythm | Consistent spacing scale, generous whitespace |
| Colour harmony | Max 1 accent family, consistent opacity scale |
| Contrast | All text meets 4.5:1 against `#050505` |
| Animation smoothness | Physics-based easing, staggered entry, breathing animations |
| Alignment | Optical alignment adjustments where mathematical centering looks wrong |

---

## Functionality (20%) — Detailed Criteria

| Check | Pass Condition |
|-------|---------------|
| Hover states | All interactive elements have hover feedback |
| Active/pressed | `scale-[0.98]` or `translateY(1px)` on press |
| Focus ring | Visible focus ring for keyboard navigation |
| Loading state | Skeleton loaders matching final layout (not spinners) |
| Empty state | Composed view with breathing orb and guidance text |
| Error state | Inline with spectral Red — not `window.alert()` |
| Responsive | Works on desktop, tablet, mobile with layout adaptation |

---

## Violation Priority Classification

| Priority     | Category                                     | Examples                                                              |
| ------------ | -------------------------------------------- | --------------------------------------------------------------------- |
| **Critical** | Background, border radius, animation engine  | Non-`#050505` bg, `rounded-lg`, CSS transitions instead of Framer     |
| **High**     | Typography, colour palette, banned elements  | Wrong font, non-spectral colours, symmetrical grid, Bootstrap cards   |
| **Medium**   | Spacing, opacity, interaction states         | Inconsistent spacing, wrong opacity values, missing hover states      |
| **Low**      | Minor refinements                            | Font weight adjustments, minor padding tweaks, icon replacements      |

---

## Audit Report Format

```
VISUAL AUDIT REPORT
═══════════════════════════════════════════════════
Component: [name]
Date: [DD/MM/YYYY]

SCREENSHOT REVIEW
─────────────────
[Screenshot: PROVIDED / NOT PROVIDED]

DESIGN RULE CHECKS
─────────────────
PASS | [rule]: [evidence]
FAIL | [rule]: [violation details + fix]

SCORE
─────
Design Quality:  [1-5] × 0.30 = [weighted]
Originality:     [1-5] × 0.25 = [weighted]
Craft:           [1-5] × 0.25 = [weighted]
Functionality:   [1-5] × 0.20 = [weighted]
─────────────────
Overall: [sum] / 5 × 100 = [percentage]%

STATUS: APPROVED | REJECTED
[If rejected: ordered fix list]
═══════════════════════════════════════════════════
```
