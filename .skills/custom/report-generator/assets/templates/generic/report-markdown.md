# Report Template - Markdown (Generic)

Generic Markdown report template adaptable to any project.

---

## Template

```markdown
# {Report Title} - {DD/MM/YYYY}

*Generated: {DD/MM/YYYY HH:mm}*

---

## Executive Summary

**Overall Status:** {PASS | WARNING | FAIL | CRITICAL}
**Overall Score:** {score}/100

### Key Findings

- {finding 1}
- {finding 2}

### Immediate Actions

1. {action 1}
2. {action 2}

---

## {Section Title}

**Status:** {Pass | Warning | Fail}

{section content — tables, lists, or prose}

---

## {Section Title}

**Status:** {Pass | Warning | Fail}

{section content}

---

*Report ID: {id} | Generator: v{version} | Time: {ms}ms*
```

---

## Formatting Conventions

| Element | Convention |
|---------|-----------|
| Headings | `#` for title, `##` for sections, `###` for subsections |
| Status | Bold text: `**Status:** Pass` |
| Tables | Standard Markdown tables with header separator |
| Lists | Unordered for findings, ordered for actions |
| Dividers | `---` between sections |
| Metadata | Italics at footer |

---

## Usage

```typescript
const report = generator.generate(data, { format: "markdown" });
const output = generator.export(report);
// Content-Type: text/markdown
```
