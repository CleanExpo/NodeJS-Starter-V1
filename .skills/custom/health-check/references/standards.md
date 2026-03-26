# Health Check -- Scientific Luxury Standards

> Domain-specific standards for the three-tier health probe architecture in NodeJS-Starter-V1. Liveness < 50ms, readiness 2-5s, deep checks all dependencies in parallel.

---

## Three-Tier Architecture

| Tier | Endpoint | Purpose | Timeout | Dependencies |
|------|----------|---------|---------|-------------|
| **1. Liveness** | `/health` (backend), `/api/health` (frontend) | Process alive? | < 50ms | None |
| **2. Readiness** | `/ready` (backend) | Can serve traffic? | 2-5s per dep | Database, Redis |
| **3. Deep** | `/api/health/deep` (frontend) | All deps healthy? | 5s per dep | All (parallel) |

---

## Health Status Model

All health endpoints use a three-state status:

| Status | HTTP Code | Meaning | Action |
|--------|-----------|---------|--------|
| `healthy` | 200 | All systems operational | None |
| `degraded` | 200 | Functional but impaired | Monitor, alert |
| `unhealthy` | 503 | Cannot serve requests | Remove from load balancer |

### Aggregation Rule

```
if any dependency is unhealthy -> overall = unhealthy (503)
else if any dependency is degraded -> overall = degraded (200)
else -> overall = healthy (200)
```

---

## Existing Endpoint Inventory

### Backend (FastAPI)

| Endpoint | Type | Location |
|----------|------|----------|
| `GET /health` | Liveness | `apps/backend/src/api/routes/health.py` |
| `GET /ready` | Readiness | `apps/backend/src/api/routes/health.py` |
| `GET /api/agents/{id}/health` | Agent health | `apps/backend/src/api/routes/agent_dashboard.py` |

### Frontend (Next.js)

| Endpoint | Type | Location |
|----------|------|----------|
| `GET /api/health` | Shallow liveness | `apps/web/app/api/health/route.ts` |
| `GET /api/health/deep` | Deep dependency | `apps/web/app/api/health/deep/route.ts` |
| `GET /api/health/routes` | Route discovery | `apps/web/app/api/health/routes/route.ts` |
| `GET /api/cron/health-check` | Periodic cron | `apps/web/app/api/cron/health-check/route.ts` |

---

## Dependency Check Interface

```typescript
interface DependencyCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unchecked';
  latency_ms: number | null;
  error: string | null;
  last_checked: string;
}
```

### Check Pattern

1. Record start time
2. Attempt operation with timeout (`AbortSignal.timeout(5000)`)
3. Measure latency (`Date.now() - start`)
4. Classify: `healthy` (success), `degraded` (slow or partial), `unhealthy` (error/timeout)

---

## Liveness Response Format

```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T09:30:00.000Z",
  "version": "0.1.0"
}
```

Rules: No database calls, no external service checks, no computation. Must respond in < 50ms.

---

## Deep Health Response Format

```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T09:30:00.000Z",
  "dependencies": [
    { "name": "database", "status": "healthy", "latency_ms": 12, "error": null },
    { "name": "redis", "status": "healthy", "latency_ms": 3, "error": null },
    { "name": "backend_api", "status": "healthy", "latency_ms": 45, "error": null }
  ],
  "summary": {
    "total_checks": 3,
    "passed": 3,
    "failed": 0,
    "degraded": 0
  }
}
```

---

## Docker Healthcheck Standards

| Service | Command | Interval | Timeout | Retries | Start Period |
|---------|---------|----------|---------|---------|-------------|
| PostgreSQL | `pg_isready -U starter_user -d starter_db` | 10s | 5s | 5 | -- |
| Redis | `redis-cli ping` | 10s | 5s | 5 | -- |
| Backend | `curl -f http://localhost:8000/health` | 30s | 10s | 3 | 40s |
| Frontend | `curl -f http://localhost:3000/api/health` | 30s | 10s | 3 | 30s |

`start_period` covers application boot time. Use `depends_on` with `condition: service_healthy` to sequence container startup.

---

## Cron-Based Monitoring

- Endpoint: `/api/cron/health-check`
- Frequency: Every 5 minutes
- Authentication: `CRON_SECRET` bearer token
- Actions: Ping backend, measure latency, log results, alert on failure

---

## Dashboard Colour Mapping

| Status | Spectral Colour | Hex |
|--------|----------------|-----|
| healthy | Emerald | `#00FF88` |
| degraded | Amber | `#FFB800` |
| unhealthy | Red | `#FF4444` |

---

## Error Taxonomy Integration

| Code | HTTP | Trigger |
|------|------|---------|
| `SYS_HEALTH_DEPENDENCY_UNAVAILABLE` | 503 | Critical dependency unreachable |
| `SYS_HEALTH_TIMEOUT` | 504 | Dependency check exceeded timeout |
