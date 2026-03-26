# Health Check -- Generic Standards

> Portable health check standards applicable to any project. Framework-agnostic, design-system-agnostic. Aligns with Kubernetes probe conventions.

---

## Principle

Health checks must be separated into three tiers: liveness (is the process alive?), readiness (can it serve traffic?), and deep (are all dependencies healthy?). Never combine them into a single endpoint.

---

## Three-Tier Architecture

| Tier | Purpose | Checks | Timeout | HTTP on Failure |
|------|---------|--------|---------|----------------|
| **Liveness** | Process alive | None (return immediately) | < 50ms | N/A (always 200) |
| **Readiness** | Can serve traffic | Critical deps (DB, cache) | 2-5s per dep | 503 |
| **Deep** | All deps healthy | All deps in parallel | 5s per dep | 503 |

---

## Status Model

| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| `healthy` | 200 | All operational |
| `degraded` | 200 | Functional but impaired |
| `unhealthy` | 503 | Cannot serve requests |

### Aggregation

- Any unhealthy -> overall unhealthy (503)
- Any degraded -> overall degraded (200)
- All healthy -> overall healthy (200)

---

## Dependency Check Pattern

For each dependency:

1. Record start time
2. Attempt operation with a timeout (5 seconds max)
3. Measure latency
4. Classify result: healthy, degraded, or unhealthy
5. Return structured result with name, status, latency, and error

Run all checks in parallel (`Promise.all` / `asyncio.gather`).

---

## Response Format

### Liveness

```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T09:30:00.000Z",
  "version": "1.0.0"
}
```

### Deep

```json
{
  "status": "healthy",
  "dependencies": [
    { "name": "database", "status": "healthy", "latency_ms": 12, "error": null },
    { "name": "cache", "status": "healthy", "latency_ms": 3, "error": null }
  ],
  "summary": { "total": 2, "passed": 2, "failed": 0, "degraded": 0 }
}
```

---

## Docker Healthcheck Pattern

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:PORT/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

- Use service-native commands where possible (e.g., `pg_isready`, `redis-cli ping`)
- Set `start_period` to cover application boot time
- Use `depends_on` with `condition: service_healthy` for startup ordering

---

## Checklist

- [ ] Three separate endpoints: liveness, readiness, deep
- [ ] Liveness has zero dependency checks and responds in < 50ms
- [ ] Readiness checks only critical dependencies with timeouts
- [ ] Deep checks all dependencies in parallel
- [ ] HTTP 503 for unhealthy, 200 for healthy/degraded
- [ ] Latency measured per dependency
- [ ] No sensitive details (credentials, internal paths) in responses
- [ ] Docker healthchecks configured with interval, timeout, retries, and start_period
