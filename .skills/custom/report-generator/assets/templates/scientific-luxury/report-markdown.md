# Report Template - Markdown (Scientific Luxury)

Markdown report template for projects using the Scientific Luxury design system.

---

## Template

```markdown
# Platform Audit Report - {DD/MM/YYYY}

*Generated: {DD/MM/YYYY HH:mm AEST} | Design System: Scientific Luxury*

---

## Executive Summary

**Overall Status:** {PASS | WARNING | FAIL | CRITICAL}
**Overall Score:** {score}/100

### Key Findings

- {finding 1}
- {finding 2}
- {finding 3}

### Immediate Actions

1. {action 1}
2. {action 2}

---

## System Health

**Status:** {Pass | Warning | Fail}

| Service  | Status       |
|----------|-------------|
| Backend  | {status}    |
| Database | {status}    |
| Redis    | {status}    |

---

## User Journeys

**Status:** {Pass | Warning | Fail}
**Pass Rate:** {passed}/{total} ({percentage}%)

| Journey | Status | Duration |
|---------|--------|----------|
| {name}  | {Pass/Fail} | {ms}ms |

---

## Route Audit

**Status:** {Pass | Warning | Fail}
**Average Score:** {score}/100
**Routes Audited:** {total}

| Route | Score | Issues |
|-------|-------|--------|
| {path} | {score}/100 | {issue count} |

---

## Friction Analysis

**Status:** {Pass | Warning | Fail}
**Friction Score:** {score}

| Friction Point | Severity | Location |
|---------------|----------|----------|
| {description} | {high/medium/low} | {component} |

---

## Scientific Luxury Compliance

**Status:** {Pass | Warning | Fail}
**Compliance Score:** {score}%

| Check | Result | Details |
|-------|--------|---------|
| Colour Palette | {Pass/Fail} | {non-spectral colours found} |
| Border Radius | {Pass/Fail} | {non-rounded-sm usage found} |
| Animation Library | {Pass/Fail} | {non-Framer-Motion usage found} |
| Background Colour | {Pass/Fail} | {non-#050505 backgrounds found} |

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Routes | {count} |
| Passing Routes | {count} |
| Failing Routes | {count} |
| Total Journeys | {count} |
| Passing Journeys | {count} |
| Failing Journeys | {count} |

---

*Report ID: {id} | Generator: v{version} | Time: {ms}ms | Locale: en-AU*
```

---

## Usage Notes

- The "Scientific Luxury Compliance" section is SL-specific; omit for non-SL projects
- All dates use DD/MM/YYYY format (en-AU locale)
- Status indicators use text (no emoji) for accessibility and terminal compatibility
- Section dividers use `---` horizontal rules
