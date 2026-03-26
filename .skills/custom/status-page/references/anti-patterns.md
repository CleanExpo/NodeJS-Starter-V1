# Status Page -- Anti-Patterns

> Banned patterns extracted from the status-page skill. Every violation disconnects status from reality, leaks internal details, or erodes user trust during incidents.

---

## AP-1: Manually Setting Status

**Severity**: High -- status page becomes disconnected from actual system health.

```python
# BANNED: Manual status curation
@status_router.post("/status/override")
async def override_status(service: str, status: str):
    await db.execute(
        text("UPDATE service_status SET status = :status WHERE name = :service"),
        {"service": service, "status": status},
    )
    return {"updated": True}
```

```python
# CORRECT: Auto-derive from health endpoint
async def check_all_services() -> list[ServiceStatusEntry]:
    health = await deep_health_check()
    entries = []
    for dep_name, dep_check in health["dependencies"].items():
        status_map = {
            "healthy": ServiceStatus.OPERATIONAL,
            "degraded": ServiceStatus.DEGRADED,
            "unhealthy": ServiceStatus.MAJOR_OUTAGE,
        }
        entries.append(ServiceStatusEntry(
            name=dep_name.replace("_", " ").title(),
            status=status_map.get(dep_check["status"], ServiceStatus.DEGRADED),
            latency_ms=dep_check.get("latency_ms"),
        ))
    return entries
```

**Why it fails**: Manual status requires someone to remember to update it during incidents and remember to clear it after. Reality and the status page diverge within minutes. Auto-deriving from the deep health endpoint ensures the status page always reflects actual system state.

---

## AP-2: Exposing Error Messages Publicly

**Severity**: Critical -- leaks internal architecture details to unauthenticated users.

```json
// BANNED: Internal details in public status API
{
  "services": [
    {
      "name": "Database",
      "status": "unhealthy",
      "error": "connection refused: postgresql://admin:pass@10.0.1.5:5432/prod"
    }
  ]
}
```

```json
// CORRECT: Status and latency only
{
  "services": [
    {
      "name": "Database",
      "status": "major_outage",
      "latency_ms": null,
      "uptime_percent": 99.95
    }
  ]
}
```

**Why it fails**: The status page is public (no authentication required). Error messages revealing database hostnames, internal IPs, connection strings, or stack traces give attackers reconnaissance data. Show status classification and latency only.

---

## AP-3: No Incident Updates

**Severity**: High -- users assume no one is working on the problem.

```
# BANNED: Silent incident timeline
Incident: Database Outage
  10:00 - Status: investigating
  ... (silence for 3 hours) ...
  13:00 - Status: resolved
```

```
# CORRECT: Regular updates every 30 minutes
Incident: Database Outage
  10:00 - Investigating: We are aware of database connectivity issues.
  10:30 - Identified: Root cause identified as network partition.
  11:00 - Monitoring: Fix deployed, monitoring recovery.
  11:30 - Monitoring: 95% of connections restored.
  12:00 - Resolved: Full connectivity restored. Post-incident review scheduled.
```

**Why it fails**: Silence during outages erodes trust more than the outage itself. Users cannot distinguish "no one is aware" from "team is actively working on it". Regular updates at 30-minute intervals demonstrate active response.

---

## AP-4: Uptime from Memory

**Severity**: Medium -- uptime data lost on restart, calculations become inaccurate.

```python
# BANNED: In-memory uptime tracking
uptime_counter = {"healthy": 0, "total": 0}

async def track_health():
    uptime_counter["total"] += 1
    if await is_healthy():
        uptime_counter["healthy"] += 1
```

```python
# CORRECT: Database-backed health log
async def log_health_snapshot() -> None:
    services = await check_all_services()
    for svc in services:
        await db.execute(
            text("""
                INSERT INTO health_check_log (service_name, status, latency_ms, checked_at)
                VALUES (:name, :status, :latency, NOW())
            """),
            {"name": svc.name, "status": svc.status.value, "latency": svc.latency_ms},
        )
```

**Why it fails**: Process restarts, deployments, and scaling events reset in-memory counters. A service that has been running for 90 days shows 100% uptime after a restart, even if it had outages. Database-backed health logs survive restarts and provide accurate historical data.

---

## AP-5: No Maintenance Windows

**Severity**: Medium -- surprise downtime erodes user trust.

```
# BANNED: Unannounced maintenance
  Friday 02:00 AEST - Services go down for 30 minutes
  Users see: major_outage
  No prior notice, no explanation, incident created after the fact
```

```python
# CORRECT: Scheduled and communicated in advance
class MaintenanceWindow(BaseModel):
    id: str
    title: str
    description: str
    scheduled_start: datetime
    scheduled_end: datetime
    affected_services: list[str]
    status: str = "scheduled"  # scheduled, in_progress, completed

@status_router.get("/maintenance")
async def get_maintenance():
    upcoming = await get_upcoming_maintenance()
    return {"upcoming": [m.model_dump() for m in upcoming], "timezone": "Australia/Sydney"}
```

**Why it fails**: Users who discover downtime without prior notice lose confidence in the platform. Scheduled maintenance windows with advance notification let users plan around the disruption. The status page should show upcoming maintenance alongside current status.

---

## AP-6: Single Overall Status

**Severity**: Medium -- hides partial outages and misleads users.

```json
// BANNED: One status for everything
{ "status": "operational" }
```

```json
// CORRECT: Per-service status with individual indicators
{
  "overall_status": "degraded",
  "services": [
    { "name": "API", "status": "operational", "uptime_percent": 99.99 },
    { "name": "Database", "status": "operational", "uptime_percent": 99.95 },
    { "name": "AI Agents", "status": "degraded", "uptime_percent": 98.50 },
    { "name": "Email", "status": "major_outage", "uptime_percent": 95.00 }
  ]
}
```

**Why it fails**: A single "operational" status hides partial outages. Users whose workflow depends on AI agents need to know agents are degraded, even if the API and database are fine. Per-service status with individual indicators gives users the information they need to make decisions.
