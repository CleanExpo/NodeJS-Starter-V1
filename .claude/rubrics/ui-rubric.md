---
name: ui-rubric
type: rubric
scored_by:
  - qa-validator
  - design-reviewer
pass_threshold: 70
version: 1.1.0
---

# UI Quality Rubric

Scored by `qa-validator` (acceptance) and `design-reviewer` (UX audit) during Phase 6 (Verification).

## Dimensions (100 points total)

### 1. Scientific Luxury Compliance (20 points)

| Score | Criteria |
|-------|----------|
| 20 | OLED black `#050505` background. Spectral colours only. `rounded-sm` corners. Single-pixel borders. No banned elements. |
| 15 | Mostly compliant with 1-2 minor token deviations. |
| 10 | Correct palette but wrong border weight, corner radius, or banned element present. |
| 5 | Generic styling with partial Scientific Luxury tokens. |
| 0 | Design system ignored entirely. |

**Banned elements** (automatic -10): `rounded-lg`, `rounded-full`, gradient backgrounds, box shadows, generic sans-serif fonts.

### 2. Visual Hierarchy (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Clear information hierarchy. JetBrains Mono for data, Editorial for names. Proper spacing rhythm. |
| 15 | Good hierarchy with minor typography inconsistencies. |
| 10 | Hierarchy present but spacing or typography breaks rhythm. |
| 5 | Flat hierarchy — all elements compete for attention. |
| 0 | No discernible hierarchy. |

### 3. Interaction & Animation (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Framer Motion only. Physics-based easings (spring, expo). Purposeful micro-interactions. No linear transitions. |
| 15 | Framer Motion used but easings could be refined. |
| 10 | CSS transitions used instead of Framer Motion. |
| 5 | Animations present but jarring or purposeless. |
| 0 | No animations or linear transitions only. |

**Approved easings**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (spring), `cubic-bezier(0.4, 0, 0.2, 1)` (smooth), `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce), `cubic-bezier(0.19, 1, 0.22, 1)` (out-expo).

### 4. Accessibility (20 points)

| Score | Criteria |
|-------|----------|
| 20 | WCAG 2.1 AA compliant. Keyboard navigable. Screen reader tested. Colour contrast ≥ 4.5:1. |
| 15 | Mostly accessible with minor contrast or focus issues. |
| 10 | Basic accessibility but missing keyboard navigation or ARIA labels. |
| 5 | Significant accessibility gaps. |
| 0 | Inaccessible — no ARIA, no keyboard support, failing contrast. |

### 5. Responsive Design (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Mobile-first. Breakpoints at 640/768/1024/1280. Touch targets ≥ 44px. No horizontal scroll. |
| 15 | Responsive but minor issues at one breakpoint. |
| 10 | Desktop-first with basic mobile support. |
| 5 | Partially responsive — breaks at common widths. |
| 0 | Desktop only — no responsive consideration. |

## Scoring

- **90-100**: UI approved. No changes needed.
- **70-89**: Minor polish needed. One iteration cycle.
- **50-69**: Significant UX issues. Return to frontend-specialist with design-reviewer feedback.
- **Below 50**: Reject. Major redesign required.

## Calibration

See `.claude/rubrics/calibration/ui-examples.md` for scored examples at each level (20, 10, 0) for every dimension. Use these to anchor scoring consistency.

## Quantified Thresholds

| Dimension | Threshold | Automatic Score Impact |
|-----------|-----------|----------------------|
| Scientific Luxury | `rounded-lg` or `rounded-xl` present | Automatic -10 |
| Scientific Luxury | Background not `#050505` | Automatic -10 |
| Scientific Luxury | Non-spectral accent colour used | -5 per instance |
| Visual Hierarchy | H1 < 2x body font size | -5 |
| Visual Hierarchy | > 3 heading levels in single view | -5 |
| Visual Hierarchy | No geometric spacing ratio | -5 |
| Interaction | CSS transition used instead of Framer Motion | -5 per instance |
| Interaction | Linear easing (`ease-linear`, `duration-*` without curve) | -5 per instance |
| Accessibility | Colour contrast < 4.5:1 | -5 per element |
| Accessibility | Interactive element without keyboard support | -5 per element |
| Responsive | Touch target < 44px | -3 per element |
| Responsive | Horizontal scroll at any standard breakpoint | Automatic -10 |

## Sprint Contract Integration

When a sprint contract exists (Phase 3.5), qa-validator ALSO scores against contract criteria:
- Each contract criterion is PASS/FAIL
- Any FAIL criterion caps the overall rubric score at 69 (forcing iteration)
