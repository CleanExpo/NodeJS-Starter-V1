# Report Generator - Standards Reference

ReportConfig interface, section-based composition, deterministic scoring, and multi-format export standards.

---

## ReportConfig Interface

All reports are configured via a `ReportConfig` object that controls output format and content inclusion.

```typescript
export type ReportFormat = "json" | "markdown" | "html";

export interface ReportConfig {
  format: ReportFormat;           // Output format
  include_evidence: boolean;      // Include raw evidence data in sections
  include_recommendations: boolean; // Include actionable recommendations
  include_metrics: boolean;       // Include numerical metrics and scores
  summary_only: boolean;          // If true, omit section details
}

// Default configuration
const defaultConfig: ReportConfig = {
  format: "markdown",
  include_evidence: true,
  include_recommendations: true,
  include_metrics: true,
  summary_only: false,
};
```

### Config Usage

```typescript
const generator = new ReportGenerator();
const report = generator.generate(data, {
  format: "html",
  summary_only: true,
});
```

Partial config is merged with defaults. Unspecified fields use default values.

---

## Section-Based Composition

### Section Interface

Every report section conforms to:

```typescript
export interface ReportSection {
  id: string;                                    // Unique section identifier
  title: string;                                 // Human-readable section name
  type: SectionType;                             // Section category
  status: "pass" | "warning" | "fail";           // Section-level status
  content: string;                               // Format-agnostic content
  data?: unknown;                                // Raw data (if include_evidence)
}

export type SectionType =
  | "health"
  | "journeys"
  | "routes"
  | "friction"
  | "verification"
  | "recommendations";
```

### Composition Rules

1. Each data source produces exactly one section
2. Missing data sources are **skipped**, not stubbed with empty sections
3. Section order follows: health > journeys > routes > friction > verification > recommendations
4. Each section calculates its own status independently
5. Section content is **format-agnostic** — no Markdown, HTML, or JSON markup

### Section Builder Pattern

```typescript
private buildHealthSection(health: HealthCheckResult): ReportSection {
  const status = health.overall === "healthy" ? "pass"
    : health.overall === "degraded" ? "warning"
    : "fail";

  return {
    id: "health",
    title: "System Health",
    type: "health",
    status,
    content: `Backend: ${health.backend} | Database: ${health.database} | Redis: ${health.redis}`,
    data: health,
  };
}
```

---

## Deterministic Score Calculation

### Overall Status Formula

```typescript
function calculateOverallStatus(sections: ReportSection[]):
  "pass" | "warning" | "fail" | "critical" {

  const failedCount = sections.filter(s => s.status === "fail").length;
  const warningCount = sections.filter(s => s.status === "warning").length;

  if (failedCount > 1) return "critical";
  if (failedCount === 1) return "fail";
  if (warningCount > 0) return "warning";
  return "pass";
}
```

### Overall Score Formula

```typescript
function calculateOverallScore(scores: number[]): number {
  if (scores.length === 0) return 100;  // No data = no issues detected
  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
}
```

### Score Source Mapping

| Data Source | Score Derivation |
|-------------|-----------------|
| Routes audit | `routes.average_score` (0-100) |
| Friction analysis | `100 - friction.metrics.friction_score` (inverted) |
| User journeys | `(passed / total) * 100` (pass rate percentage) |
| Health check | Binary: 100 (healthy) or 0 (unhealthy) |

### Rules

- Missing data sources are **excluded** from the average, not treated as 0
- Scores are always integers (rounded via `Math.round`)
- Score range: 0-100 inclusive
- A score of 100 means either all checks passed or no checks were run (annotated in metadata)

---

## Report Summary Interface

```typescript
export interface ReportSummary {
  overall_status: "pass" | "warning" | "fail" | "critical";
  overall_score: number;          // 0-100
  key_findings: string[];         // Top-level findings (max 5)
  immediate_actions: string[];    // Required actions sorted by priority
  stats: ReportStats;
}

export interface ReportStats {
  total_routes: number;
  passing_routes: number;
  failing_routes: number;
  total_journeys: number;
  passing_journeys: number;
  failing_journeys: number;
}
```

---

## Report Metadata Interface

```typescript
export interface ReportMetadata {
  generator_version: string;      // Semantic version of the generator
  generation_time_ms: number;     // Time taken to generate (milliseconds)
  data_sources: string[];         // Which data sources were included
  config: ReportConfig;           // Configuration used for this run
}
```

Every report must include metadata. This enables:
- **Reproducibility**: Same config + same data = same report
- **Auditing**: When, how, and from what data was this report generated
- **Versioning**: Generator version tracks format compatibility

---

## Multi-Format Export Standards

### JSON Export

```typescript
function exportJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}
```

- Indented with 2 spaces for readability
- Content-Type: `application/json`
- File extension: `.json`

### Markdown Export

```typescript
function exportMarkdown(report: AuditReport): string {
  let md = `# ${report.title}\n\n`;
  md += `*Generated: ${new Date(report.generated_at).toLocaleString("en-AU")}*\n\n`;
  md += `## Executive Summary\n\n`;
  md += `**Overall Status:** ${formatStatus(report.summary.overall_status)}\n`;
  md += `**Overall Score:** ${report.summary.overall_score}/100\n\n`;

  for (const section of report.sections) {
    md += `## ${section.title}\n\n`;
    md += `${section.content}\n\n---\n\n`;
  }

  md += `*Report ID: ${report.id}*\n`;
  return md;
}
```

- Dates formatted with `en-AU` locale (DD/MM/YYYY)
- Content-Type: `text/markdown`
- File extension: `.md`

### HTML Export

```typescript
function exportHtml(report: AuditReport): string {
  const markdownContent = exportMarkdown(report);
  return wrapInHtmlTemplate(convertMarkdownToHtml(markdownContent));
}
```

- Wraps converted Markdown in a styled HTML template
- Content-Type: `text/html`
- File extension: `.html`

---

## Locale Standards (en-AU)

| Element | Format | Example |
|---------|--------|---------|
| Date | DD/MM/YYYY | 26/03/2026 |
| Date-time | DD/MM/YYYY HH:mm AEST | 26/03/2026 14:30 AEST |
| Numbers | Comma thousands separator | 2,847 |
| Currency | AUD with $ prefix | $1,250.00 |
| Spelling | Australian English | colour, behaviour, analyse |
