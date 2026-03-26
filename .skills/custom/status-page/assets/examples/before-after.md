# Status Page -- Before/After Examples

> Concrete transformations from anti-patterns to proper status page implementation.

---

## Example 1: Manual Status to Auto-Derived

### Before

```python
# Manual status management -- disconnected from reality
@router.get("/status")
async def get_status():
    statuses = await db.execute(text("SELECT * FROM manual_service_status"))
    return {"services": [dict(row) for row in statuses]}

@router.post("/status/update")
async def update_status(service: str, status: str):
    await db.execute(
        text("UPDATE manual_service_status SET status = :status WHERE name = :service"),
        {"service": service, "status": status},
    )
    return {"updated": True}
```

**Problems**: Requires someone to manually update during incidents. Status diverges from reality within minutes. Forgotten updates leave stale status.

### After

```python
# Auto-derived from existing deep health endpoint
@status_router.get("/")
async def get_status_overview():
    services = await check_all_services()  # Calls deep_health_check()
    active_incidents = await get_active_incidents()

    overall = ServiceStatus.OPERATIONAL
    for svc in services:
        if svc.status == ServiceStatus.MAJOR_OUTAGE:
            overall = ServiceStatus.MAJOR_OUTAGE
            break
        if svc.status == ServiceStatus.DEGRADED:
            overall = ServiceStatus.DEGRADED

    return {
        "overall_status": overall.value,
        "services": [s.model_dump() for s in services],
        "active_incidents": [i.model_dump() for i in active_incidents],
        "last_updated": datetime.now().isoformat(),
    }
```

---

## Example 2: Single Overall Status to Per-Service

### Before

```json
{
  "status": "operational"
}
```

**Problems**: Hides partial outages. Users cannot determine which services are affected.

### After

```json
{
  "overall_status": "degraded",
  "services": [
    { "name": "API", "status": "operational", "latency_ms": 45, "uptime_percent": 99.99 },
    { "name": "Database", "status": "operational", "latency_ms": 12, "uptime_percent": 99.95 },
    { "name": "AI Agents", "status": "degraded", "latency_ms": 2500, "uptime_percent": 98.50 },
    { "name": "Email", "status": "major_outage", "latency_ms": null, "uptime_percent": 95.00 }
  ],
  "active_incidents": [
    {
      "id": "inc-001",
      "title": "Email delivery delays",
      "severity": "major",
      "status": "identified",
      "updates": [
        { "status": "investigating", "message": "Reports of delayed emails.", "created_at": "2026-03-26T10:00:00+11:00" },
        { "status": "identified", "message": "Root cause: provider rate limiting.", "created_at": "2026-03-26T10:30:00+11:00" }
      ]
    }
  ]
}
```

---

## Example 3: Silent Incident to Communicated Incident

### Before

```
Incident timeline:
  10:00 AEST - investigating
  13:00 AEST - resolved
  (3 hours of silence)
```

### After

```
Incident timeline:
  10:00 AEST - INVESTIGATING: We are aware of connectivity issues affecting the AI agent service.
  10:30 AEST - IDENTIFIED: Root cause identified as provider rate limiting. Implementing fallback.
  11:00 AEST - MONITORING: Fallback provider activated. Monitoring response times.
  11:30 AEST - MONITORING: Response times returning to normal. 90% of requests succeeding.
  12:00 AEST - RESOLVED: Full service restored. Post-incident review scheduled for 27/03/2026.
```

---

## Example 4: In-Memory Uptime to Database-Backed

### Before

```python
# Lost on every restart
uptime_data = {}

async def track():
    for service in services:
        if service not in uptime_data:
            uptime_data[service] = {"healthy": 0, "total": 0}
        uptime_data[service]["total"] += 1
        if await is_healthy(service):
            uptime_data[service]["healthy"] += 1
```

### After

```python
# Persistent, survives restarts, accurate over 90+ days
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

# Query for uptime percentage
@status_router.get("/uptime")
async def get_uptime(days: int = 90):
    results = await db.execute(
        text("""
            SELECT service_name,
                   COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 / COUNT(*) AS uptime_percent
            FROM health_check_log
            WHERE checked_at >= NOW() - INTERVAL ':days days'
            GROUP BY service_name
        """),
        {"days": days},
    )
    return {"period_days": days, "services": [{"name": r.service_name, "uptime_percent": round(r.uptime_percent, 3)} for r in results]}
```
