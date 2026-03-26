# Report Generator - Before/After Examples

Demonstrates the difference between ad-hoc report generation and structured ReportGenerator output.

---

## Example 1: Platform Audit Report

### BEFORE (Ad-Hoc)

```typescript
async function generateAuditReport() {
  const health = await checkHealth();
  const routes = await auditRoutes();

  let report = "# Audit Report\n\n";
  report += `Health: ${health.ok ? "OK" : "BAD"}\n`;
  report += `Routes: ${routes.length} checked\n`;
  report += `Score: 85\n`;  // <-- Where did 85 come from?
  report += `Status: PASS\n`;  // <-- How was this determined?

  for (const route of routes) {
    report += `- ${route.path}: ${route.score}\n`;
  }

  return report;
}
```

**Problems**:
- Score (85) is hardcoded, not calculated from evidence
- Status ("PASS") is manually assigned, not derived from section results
- No metadata — when was this generated? What version? What config?
- Single format — cannot export to JSON or HTML
- Monolithic — cannot add sections without rewriting the function
- No section-level status — cannot tell which areas passed or failed

### AFTER (Structured ReportGenerator)

```typescript
import { ReportGenerator } from "@/lib/audit/report-generator";

async function generateAuditReport(config: Partial<ReportConfig> = {}) {
  const generator = new ReportGenerator();

  // Fetch data sources independently
  const health = await checkHealth();
  const routes = await auditRoutes();
  const journeys = await runJourneyTests();

  // Generate report — sections built independently, scores calculated
  const report = generator.generate(
    { health, routes, journeys },
    { format: "markdown", ...config },
  );

  // Export in requested format
  return generator.export(report);
}
```

**Output (Markdown)**:

```markdown
# Platform Audit Report - 26/03/2026

*Generated: 26/03/2026 14:30 AEST*

## Executive Summary

**Overall Status:** WARNING
**Overall Score:** 78/100

### Key Findings

- 2 routes have scores below 60
- Authentication journey failed on token refresh
- System health is degraded (Redis connection timeout)

### Immediate Actions

1. Investigate Redis connection timeout
2. Fix token refresh logic in auth journey
3. Review low-scoring routes: /api/analytics, /api/export

---

## System Health

**Status:** Warning

Backend: healthy | Database: connected | Redis: timeout

---

## User Journeys

**Status:** Fail

4/5 journeys passed (80%)

| Journey | Status | Duration |
|---------|--------|----------|
| Login | Pass | 230ms |
| Registration | Pass | 450ms |
| Dashboard Load | Pass | 180ms |
| Token Refresh | Fail | 5,002ms |
| Logout | Pass | 120ms |

---

## Route Audit

**Status:** Warning

15 routes audited | Average score: 74/100

---

*Report ID: report_a1b2c3d4 | Generator: v1.0.0 | Time: 342ms*
```

**Improvements**:
- Score (78) calculated from section evidence: avg(74 route score, 80 journey pass rate)
- Status (WARNING) derived deterministically: 0 critical, 0 multi-fail, 1 warning section
- Full metadata: ID, timestamp, version, generation time
- Section-based: each section has its own status
- Multi-format: same data can export to JSON or HTML
- Extensible: add new data sources without modifying existing sections

---

## Example 2: JSON Export

### BEFORE (Ad-Hoc)

```typescript
const result = {
  ok: true,
  routes_checked: 15,
  score: 85,
};
return JSON.stringify(result);
```

### AFTER (Structured)

```json
{
  "id": "report_a1b2c3d4",
  "generated_at": "2026-03-26T04:30:00.000Z",
  "format": "json",
  "title": "Platform Audit Report - 26/03/2026",
  "summary": {
    "overall_status": "warning",
    "overall_score": 78,
    "key_findings": [
      "2 routes have scores below 60",
      "Authentication journey failed on token refresh"
    ],
    "immediate_actions": [
      "Investigate Redis connection timeout",
      "Fix token refresh logic"
    ],
    "stats": {
      "total_routes": 15,
      "passing_routes": 13,
      "failing_routes": 2,
      "total_journeys": 5,
      "passing_journeys": 4,
      "failing_journeys": 1
    }
  },
  "sections": [
    {
      "id": "health",
      "title": "System Health",
      "type": "health",
      "status": "warning",
      "content": "Backend: healthy | Database: connected | Redis: timeout"
    }
  ],
  "metadata": {
    "generator_version": "1.0.0",
    "generation_time_ms": 342,
    "data_sources": ["health_check", "user_journeys", "route_audit"],
    "config": {
      "format": "json",
      "include_evidence": true,
      "include_recommendations": true,
      "include_metrics": true,
      "summary_only": false
    }
  }
}
```

---

## Example 3: Summary-Only Mode

### BEFORE

No concept of summary mode — always returns full report or nothing.

### AFTER

```typescript
const report = generator.generate(data, { summary_only: true });
```

```markdown
# Platform Audit Report - 26/03/2026

## Executive Summary

**Overall Status:** WARNING
**Overall Score:** 78/100

### Key Findings

- 2 routes have scores below 60
- Authentication journey failed on token refresh

### Immediate Actions

1. Investigate Redis connection timeout
2. Fix token refresh logic

*Report ID: report_a1b2c3d4 | Generator: v1.0.0*
```

Section details omitted — only the summary is rendered. Useful for executive dashboards and notifications.
