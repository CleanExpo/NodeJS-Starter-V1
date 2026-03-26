# Report Generator - Generic Standards

Generic report generation patterns applicable to any project. Adapt data models, section types, and export formats to your domain.

---

## Universal Report Structure

Every report, regardless of domain, should contain these layers:

```
Report
├── Identity (id, timestamp, title)
├── Summary (status, score, key findings)
├── Sections[] (independent, composable units)
├── Metadata (version, timing, config, sources)
└── Export (format-specific rendering)
```

---

## Generic Data Model

```typescript
interface Report {
  id: string;
  generated_at: string;     // ISO 8601
  title: string;
  summary: {
    status: string;          // Overall status (domain-specific values)
    score: number;           // 0-100 aggregate score
    findings: string[];      // Key findings (max 5)
    actions: string[];       // Required actions
  };
  sections: Section[];
  metadata: {
    generator_version: string;
    generation_time_ms: number;
    data_sources: string[];
    config: Record<string, unknown>;
  };
}

interface Section {
  id: string;
  title: string;
  type: string;
  status: string;
  content: string;
  data?: unknown;
}
```

---

## Generic Section Composition

### Builder Pattern

```typescript
class ReportBuilder {
  private sections: Section[] = [];
  private dataSources: string[] = [];

  addSection(source: string, builder: () => Section | null): this {
    const section = builder();
    if (section) {
      this.sections.push(section);
      this.dataSources.push(source);
    }
    return this;
  }

  build(config: Partial<ReportConfig>): Report {
    const summary = this.calculateSummary();
    return {
      id: generateId(),
      generated_at: new Date().toISOString(),
      title: config.title ?? "Report",
      summary,
      sections: this.sections,
      metadata: {
        generator_version: "1.0.0",
        generation_time_ms: 0,
        data_sources: this.dataSources,
        config,
      },
    };
  }
}
```

### Composition Rules

1. **Each data source maps to one section** — one-to-one relationship
2. **Missing sources are skipped** — never create empty placeholder sections
3. **Section status is self-contained** — each section determines its own status
4. **Summary aggregates sections** — never calculate summary independently

---

## Generic Score Calculation

### Aggregate Score

```
overall_score = sum(section_scores) / count(section_scores)
```

- Missing sections are excluded, not zero-filled
- Score range: 0-100
- Round to nearest integer

### Status Derivation

```
if (failed_sections > threshold_critical) → "critical"
if (failed_sections > 0)                 → "fail"
if (warning_sections > 0)                → "warning"
else                                     → "pass"
```

Thresholds are configurable per project. Default: `threshold_critical = 1`.

---

## Generic Export Formats

### JSON

- Use `JSON.stringify(report, null, 2)` for human-readable output
- Content-Type: `application/json`
- Best for: API responses, data pipelines, programmatic consumption

### Markdown

- Section headings map to `## Section Title`
- Status values rendered with emoji or text indicators
- Best for: Git repositories, documentation, developer consumption

### HTML

- Convert Markdown to HTML, wrap in styled template
- Include inline CSS for standalone rendering (no external dependencies)
- Best for: Email reports, browser viewing, stakeholder distribution

### CSV (Optional)

- Flatten section data into rows
- Best for: Spreadsheet analysis, data export

---

## Generic Scheduling Patterns

### Cron-Based Generation

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6)
│ │ │ │ │
0 8 * * 1    ← Weekly report, Monday 08:00
0 6 * * *    ← Daily report, 06:00
0 0 1 * *    ← Monthly report, 1st at midnight
```

### On-Demand Generation

- API endpoint accepts config and data source selection
- Returns report in requested format
- Optionally stores report for later retrieval

---

## Generic Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|-------------|---------|------------------|
| Guessed scores | Misleading, not reproducible | Calculate from evidence |
| Monolithic builder | Cannot extend or test | Section-based composition |
| Format in data layer | Cannot export multiple formats | Format-agnostic data model |
| Missing metadata | Cannot audit or reproduce | Always include identity and config |
| Synchronous heavy processing | Blocks API response | Background queue for large reports |
| String concatenation | Cannot filter or reorder | Structured section array |
