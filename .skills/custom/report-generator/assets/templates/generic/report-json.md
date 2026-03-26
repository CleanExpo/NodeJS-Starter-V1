# Report Template - JSON (Generic)

Generic JSON report template adaptable to any project.

---

## Template

```json
{
  "id": "report_{uuid_8}",
  "generated_at": "{ISO 8601 timestamp}",
  "format": "json",
  "title": "{Report Title} - {DD/MM/YYYY}",
  "summary": {
    "overall_status": "{pass | warning | fail | critical}",
    "overall_score": 0,
    "key_findings": [
      "{finding 1}",
      "{finding 2}"
    ],
    "immediate_actions": [
      "{action 1}",
      "{action 2}"
    ],
    "stats": {}
  },
  "sections": [
    {
      "id": "{section_id}",
      "title": "{Section Title}",
      "type": "{section_type}",
      "status": "{pass | warning | fail}",
      "content": "{format-agnostic content}",
      "data": {}
    }
  ],
  "metadata": {
    "generator_version": "1.0.0",
    "generation_time_ms": 0,
    "data_sources": [],
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

## Customisation Points

| Field | Customise For |
|-------|--------------|
| `summary.stats` | Project-specific aggregate statistics |
| `sections[].type` | Domain-specific section categories |
| `sections[].data` | Raw evidence data per section |
| `metadata.config` | Additional project-specific configuration options |

---

## Usage

```typescript
const report = generator.generate(data, { format: "json" });
const output = JSON.stringify(report, null, 2);
// Content-Type: application/json
```
