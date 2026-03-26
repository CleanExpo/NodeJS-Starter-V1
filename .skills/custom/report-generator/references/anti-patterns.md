# Report Generator - Anti-Patterns Reference

Banned patterns in report generation. Every item here has caused incorrect, misleading, or unmaintainable reports in practice.

---

## Anti-Pattern 1: Guessed Scores

**Banned**: Hardcoding or manually assigning status values instead of calculating them from evidence.

### What It Looks Like

```typescript
// WRONG — hardcoded status
const report = {
  overall_status: "pass",  // <-- Who decided this?
  overall_score: 85,       // <-- Where did 85 come from?
};
```

### Why It Is Banned

- Scores drift from reality as underlying data changes
- No audit trail — impossible to explain why a score is what it is
- Different report runs produce inconsistent results
- Misleading to stakeholders who trust the numbers

### Correct Approach

```typescript
// CORRECT — calculated from section evidence
const failedSections = sections.filter(s => s.status === "fail").length;
const warningSections = sections.filter(s => s.status === "warning").length;

let overallStatus: "pass" | "warning" | "fail" | "critical" = "pass";
if (failedSections > 1) overallStatus = "critical";
else if (failedSections === 1) overallStatus = "fail";
else if (warningSections > 0) overallStatus = "warning";

const overallScore = scores.length > 0
  ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  : 100;
```

**Rule**: Every score must trace back to a formula. Every status must trace back to section results.

---

## Anti-Pattern 2: Monolithic Report Builder

**Banned**: Building reports as a single function that handles all data aggregation, formatting, and output in one pass.

### What It Looks Like

```typescript
// WRONG — everything in one function
function generateReport(data: any): string {
  let output = "# Report\n\n";
  output += `Status: ${data.health?.ok ? "pass" : "fail"}\n`;
  output += `Routes: ${data.routes?.length} checked\n`;
  // ... 200 more lines mixing data logic and formatting
  output += "</div>";  // Wait, is this Markdown or HTML?
  return output;
}
```

### Why It Is Banned

- Cannot add new sections without modifying the entire function
- Format logic entangled with data aggregation
- Cannot export to multiple formats
- Cannot test data logic independently from rendering

### Correct Approach

Section-based composition: each section is built independently, then composed into a format-agnostic report model, then rendered by a pluggable formatter.

---

## Anti-Pattern 3: Format Logic in Aggregation

**Banned**: Embedding format-specific markup (Markdown, HTML, JSON structure) in the data aggregation layer.

### What It Looks Like

```typescript
// WRONG — Markdown in data layer
function buildHealthSection(health: HealthCheck): ReportSection {
  return {
    id: "health",
    title: "## System Health\n\n",  // <-- Markdown heading in data
    content: `**Status**: ${health.status}\n`,  // <-- Markdown bold in data
    status: health.ok ? "pass" : "fail",
  };
}
```

### Why It Is Banned

- Cannot export the same data to JSON, HTML, and Markdown
- Section titles rendered with `## ##` in HTML output
- Format assumptions leak into data model
- Breaks single responsibility principle

### Correct Approach

Data model is format-agnostic. Format is applied at export time.

```typescript
// CORRECT — plain data in section
function buildHealthSection(health: HealthCheck): ReportSection {
  return {
    id: "health",
    title: "System Health",
    content: `Status: ${health.status}`,
    status: health.ok ? "pass" : "fail",
  };
}

// Format applied at export
function exportMarkdown(report: AuditReport): string {
  let md = `# ${report.title}\n\n`;
  for (const section of report.sections) {
    md += `## ${section.title}\n\n${section.content}\n\n`;
  }
  return md;
}
```

---

## Anti-Pattern 4: Missing Metadata

**Banned**: Reports without identification, timestamp, version, or configuration metadata.

### What It Looks Like

```typescript
// WRONG — no metadata
return {
  status: "pass",
  sections: [...],
};
```

### Why It Is Banned

- Cannot identify which report run produced this output
- Cannot reproduce the report with the same configuration
- Cannot audit when and how the report was generated
- No versioning for backward compatibility

### Correct Approach

Every report includes:

```typescript
{
  id: `report_${crypto.randomUUID().slice(0, 8)}`,
  generated_at: new Date().toISOString(),
  format: "markdown",
  metadata: {
    generator_version: "1.0.0",
    generation_time_ms: Date.now() - startTime,
    data_sources: ["health_check", "user_journeys"],
    config: { format: "markdown", include_evidence: true },
  },
}
```

---

## Anti-Pattern 5: Synchronous Heavy Processing

**Banned**: Blocking the API response while generating large reports (especially PDF or HTML with embedded data).

### What It Looks Like

```typescript
// WRONG — blocks request for 30+ seconds
export async function POST(request: Request) {
  const report = await generateFullReport();  // 30s
  const pdf = await convertToPdf(report);     // 15s
  return new Response(pdf);                    // 45s total response time
}
```

### Why It Is Banned

- API timeouts (typically 30s limit)
- Poor user experience — no progress feedback
- Server resources blocked for single request

### Correct Approach

Use background generation with a queue for heavy reports. Return a job ID, allow polling or webhook notification.

---

## Anti-Pattern 6: Unstructured Section Composition

**Banned**: Building report content as a single concatenated string without structured section boundaries.

### What It Looks Like

```typescript
// WRONG — string concatenation with no structure
let report = "";
report += "Health: OK\n";
report += "Routes: 15 checked\n";
report += "Errors: 2 found\n";
```

### Why It Is Banned

- Cannot filter, sort, or reorder sections
- Cannot calculate per-section status
- Cannot export individual sections
- Cannot aggregate section scores into overall status

### Correct Approach

```typescript
const sections: ReportSection[] = [];
if (data.health) sections.push(buildHealthSection(data.health));
if (data.routes) sections.push(buildRoutesSection(data.routes));
// Summary calculated from section array
const summary = calculateSummary(sections, data);
```
