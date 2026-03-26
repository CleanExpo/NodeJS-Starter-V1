# Status Page -- Scientific Luxury Standards

> Domain-specific standards for the public status page in NodeJS-Starter-V1. Auto-derived from deep health endpoint, incident management with timeline, uptime calculation from database, Scientific Luxury UI.

---

## Service Status Model

```python
class ServiceStatus(str, Enum):
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    PARTIAL_OUTAGE = "partial_outage"
    MAJOR_OUTAGE = "major_outage"
    MAINTENANCE = "maintenance"
```

### Status Mapping from Health Checks

| Health Status | Service Status | Colour |
|---------------|---------------|--------|
| `healthy` | `operational` | Emerald `#00FF88` |
| `degraded` | `degraded` | Amber `#FFB800` |
| `unhealthy` | `major_outage` | Red `#FF4444` |
| (maintenance) | `maintenance` | Cyan `#00F5FF` |

---

## Incident Model

```python
class IncidentSeverity(str, Enum):
    MINOR = "minor"       # Performance degradation
    MAJOR = "major"       # Partial functionality loss
    CRITICAL = "critical" # Full service outage

class IncidentUpdate(BaseModel):
    status: str  # investigating, identified, monitoring, resolved
    message: str
    created_at: datetime

class Incident(BaseModel):
    id: str
    title: str
    severity: IncidentSeverity
    status: str = "investigating"
    affected_services: list[str]
    updates: list[IncidentUpdate]
    started_at: datetime
    resolved_at: datetime | None = None
```

### Incident Status Flow

```
investigating -> identified -> monitoring -> resolved
```

Updates must be posted every 30 minutes until resolution.

---

## Uptime Calculation

Uptime is calculated from the `health_check_log` database table:

```sql
SELECT service_name,
       COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 / COUNT(*)
           AS uptime_percent
FROM health_check_log
WHERE checked_at >= NOW() - INTERVAL '90 days'
GROUP BY service_name
```

### Database Table

```sql
CREATE TABLE health_check_log (
    id BIGSERIAL PRIMARY KEY,
    service_name TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms REAL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_log_service_time
    ON health_check_log (service_name, checked_at DESC);
```

Health snapshots are logged every 60 seconds by the periodic task.

---

## API Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/status` | None (public) | Overall status + services + incidents |
| `GET /api/status/uptime?days=90` | None (public) | Uptime percentages per service |
| `GET /api/status/maintenance` | None (public) | Upcoming maintenance windows |
| `POST /api/status/incidents` | `status:manage` | Create incident |
| `POST /api/status/incidents/{id}/updates` | `status:manage` | Add incident update |

---

## Maintenance Window Model

```python
class MaintenanceWindow(BaseModel):
    id: str
    title: str
    description: str
    scheduled_start: datetime
    scheduled_end: datetime
    affected_services: list[str]
    status: str = "scheduled"  # scheduled, in_progress, completed
```

Display times in `Australia/Sydney` (AEST/AEDT) by default.

---

## Scientific Luxury UI Standards

- **Background**: OLED Black `#050505`
- **Container**: `bg-[#0a0a0a]` or transparent
- **Typography**: `font-mono`, `text-white/90` for primary, `text-white/70` for secondary, `text-white/40` for muted
- **Borders**: `border-white/[0.06]` single-pixel
- **Corners**: `rounded-sm` (2px) only
- **Animations**: Framer Motion entrance (`opacity: 0 -> 1`, `y: 20 -> 0`)
- **Status indicators**: Breathing pulse orbs for non-operational states, solid for operational
- **Colour mapping**: Emerald (operational), Amber (degraded), Red (outage), Cyan (maintenance)

---

## Three Laws of Status Pages

1. **Honest by Default**: Status reflects real dependency checks, not manually curated
2. **Public Information Only**: Never expose internal errors, stack traces, or infrastructure details
3. **Communicate During Incidents**: Updates every 30 minutes until resolution
