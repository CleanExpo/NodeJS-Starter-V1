# Status Page -- Generic Standards

> Portable status page standards applicable to any project. Framework-agnostic, design-system-agnostic.

---

## Principle

A public status page must reflect real system health derived from automated checks. Manual overrides are an anti-pattern. Every incident must have regular updates until resolution.

---

## Service Status Model

| Status | Meaning | User Action |
|--------|---------|-------------|
| `operational` | All systems normal | None |
| `degraded` | Functional but impaired | Monitor |
| `partial_outage` | Some functionality unavailable | Use alternatives |
| `major_outage` | Service unavailable | Wait for resolution |
| `maintenance` | Planned downtime | Scheduled, expect restoration |

---

## Incident Model

Each incident requires:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Brief description |
| `severity` | enum | minor, major, critical |
| `status` | string | investigating, identified, monitoring, resolved |
| `affected_services` | list | Services impacted |
| `updates` | list | Timeline of status updates |
| `started_at` | datetime | When the incident began |
| `resolved_at` | datetime (nullable) | When the incident was resolved |

### Update Frequency

- **Critical**: Every 15 minutes
- **Major**: Every 30 minutes
- **Minor**: Every 60 minutes

---

## Uptime Calculation

- Store health check results in a database table
- Calculate uptime as: `(healthy_checks / total_checks) * 100`
- Display over configurable periods (7 days, 30 days, 90 days)
- Never calculate from in-memory counters (lost on restart)

---

## Public API Requirements

- Status overview endpoint: no authentication required
- Incident management endpoints: authentication required
- Never expose internal error messages, stack traces, or infrastructure details
- Return service name, status, latency, and uptime percentage only

---

## Maintenance Windows

- Schedule maintenance in advance with affected services listed
- Display upcoming maintenance on the status page
- Show times in the user's timezone (or a documented default)
- Transition status to "maintenance" during the window

---

## Checklist

- [ ] Status derived from automated health checks, not manual overrides
- [ ] Per-service status (not a single overall status)
- [ ] Incident model with severity, timeline, and affected services
- [ ] Regular incident updates until resolution
- [ ] Uptime calculated from database-backed health logs
- [ ] Maintenance windows scheduled and displayed in advance
- [ ] No sensitive details in public responses
- [ ] Subscriber notifications on incident creation and updates
