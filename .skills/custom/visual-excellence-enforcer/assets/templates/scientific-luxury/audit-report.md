# Scientific Luxury Visual Audit Report — Template

> Fill in the bracketed sections. Run through each check systematically.

```
VISUAL AUDIT REPORT — Scientific Luxury
═══════════════════════════════════════════════════
Component: [component name / page URL]
Date: [DD/MM/YYYY]
Auditor: [agent or human]

SCREENSHOT REVIEW
─────────────────
Screenshot: [PROVIDED / NOT PROVIDED]
[If not provided: BLOCKED — screenshot required before proceeding]

DESIGN RULE CHECKS
─────────────────

Background
  [PASS/FAIL] | OLED Black #050505
  [Evidence: class name or hex value found]

Border Radius
  [PASS/FAIL] | rounded-sm only
  [Evidence: list any rounded-lg/xl/full found with line numbers]

Borders
  [PASS/FAIL] | border-[0.5px] border-white/[0.06]
  [Evidence: border classes found]

Colours
  [PASS/FAIL] | Spectral palette (Cyan #00F5FF, Emerald #00FF88, Amber #FFB800, Red #FF4444, Magenta #FF00FF)
  [Evidence: colour values found — flag any non-spectral colours]

Typography — Data
  [PASS/FAIL] | JetBrains Mono for data/code values
  [Evidence: font-mono class presence on data elements]

Typography — Headings
  [PASS/FAIL] | Editorial New or font-light/extralight hierarchy
  [Evidence: font classes on headings]

Animations
  [PASS/FAIL] | Framer Motion only — no CSS transitions
  [Evidence: search for transition-all, animate- classes, @keyframes]

Shadows
  [PASS/FAIL] | None or spectral glow only
  [Evidence: box-shadow values found]

Layout
  [PASS/FAIL] | Timeline/asymmetric — no symmetrical card grids
  [Evidence: grid-cols-2/4 presence or absence]

Content
  [PASS/FAIL] | No AI tells (Lorem Ipsum, John Doe, round numbers, generic copy)
  [Evidence: content samples checked]

SCORING
─────────────────
Design Quality:  [1-5]/5 × 0.30 = [result]
  [Brief rationale]

Originality:     [1-5]/5 × 0.25 = [result]
  [Brief rationale]

Craft:           [1-5]/5 × 0.25 = [result]
  [Brief rationale]

Functionality:   [1-5]/5 × 0.20 = [result]
  [Brief rationale]

─────────────────
Overall Score: [sum] / 5 × 100 = [percentage]%

STATUS: [APPROVED / REJECTED]

FIX PLAN (if rejected — ordered by priority)
─────────────────

Fix 1 [Critical]: [description]
  File: [path]
  Change: [old] → [new]
  Commit: [commit message]

Fix 2 [High]: [description]
  File: [path]
  Change: [old] → [new]
  Commit: [commit message]

Fix 3 [Medium]: [description]
  File: [path]
  Change: [old] → [new]
  Commit: [commit message]

═══════════════════════════════════════════════════
```

## Minimum Pass Threshold

- Overall score >= 70% for approval
- No **Critical** violations remaining
- Screenshot must be provided (description is not accepted as proof)
