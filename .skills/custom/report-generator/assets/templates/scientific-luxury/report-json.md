# Report Template - JSON (Scientific Luxury)

JSON report template for projects using the Scientific Luxury design system.

---

## Template

```json
{
  "id": "report_{uuid_8}",
  "generated_at": "{ISO 8601 timestamp}",
  "format": "json",
  "title": "Platform Audit Report - {DD/MM/YYYY}",
  "design_system": "scientific-luxury",
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
    "stats": {
      "total_routes": 0,
      "passing_routes": 0,
      "failing_routes": 0,
      "total_journeys": 0,
      "passing_journeys": 0,
      "failing_journeys": 0
    }
  },
  "sections": [
    {
      "id": "health",
      "title": "System Health",
      "type": "health",
      "status": "{pass | warning | fail}",
      "content": "Backend: {status} | Database: {status} | Redis: {status}",
      "data": {
        "backend": "{healthy | degraded | down}",
        "database": "{connected | disconnected}",
        "redis": "{connected | disconnected}"
      }
    },
    {
      "id": "journeys",
      "title": "User Journeys",
      "type": "journeys",
      "status": "{pass | warning | fail}",
      "content": "{passed}/{total} journeys passed",
      "data": {
        "results": []
      }
    },
    {
      "id": "routes",
      "title": "Route Audit",
      "type": "routes",
      "status": "{pass | warning | fail}",
      "content": "{total} routes audited | Average score: {score}/100",
      "data": {
        "routes": [],
        "average_score": 0
      }
    },
    {
      "id": "friction",
      "title": "Friction Analysis",
      "type": "friction",
      "status": "{pass | warning | fail}",
      "content": "Friction score: {score} | {count} friction points identified",
      "data": {
        "friction_score": 0,
        "friction_points": []
      }
    },
    {
      "id": "design_system",
      "title": "Scientific Luxury Compliance",
      "type": "verification",
      "status": "{pass | warning | fail}",
      "content": "SL compliance: {score}% | Violations: {count}",
      "data": {
        "compliance_score": 0,
        "violations": {
          "colour_palette": [],
          "border_radius": [],
          "animation_library": [],
          "background_colour": []
        }
      }
    }
  ],
  "metadata": {
    "generator_version": "1.0.0",
    "generation_time_ms": 0,
    "data_sources": ["health_check", "user_journeys", "route_audit", "friction_analysis"],
    "config": {
      "format": "json",
      "include_evidence": true,
      "include_recommendations": true,
      "include_metrics": true,
      "summary_only": false
    },
    "locale": "en-AU",
    "timezone": "AEST"
  }
}
```

---

## Usage Notes

- The `design_system` field identifies this as an SL-themed report
- The `design_system` section type (`verification`) audits SL compliance: spectral colours, border radius, animation library, background colour
- Dates in `generated_at` use ISO 8601; display dates use DD/MM/YYYY (en-AU)
- All colour references use hex codes from the SL palette: `#00F5FF`, `#00FF88`, `#FFB800`, `#FF4444`, `#FF00FF`
