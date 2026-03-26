# Health Check -- Anti-Patterns

> Banned patterns extracted from the health-check skill. Every violation causes false positives, traffic routing to broken instances, or blocked health responses.

---

## AP-1: Single-Tier Health Check

**Severity**: High -- conflates liveness, readiness, and dependency checks into one endpoint.

```python
# BANNED: One endpoint that does everything
@router.get("/health")
async def health():
    db_ok = await check_database()
    redis_ok = await check_redis()
    ai_ok = await check_ai_provider()
    return {"status": "ok" if all([db_ok, redis_ok, ai_ok]) else "error"}
```

```python
# CORRECT: Three separate tiers
@router.get("/health")
async def liveness():
    """Tier 1: Process alive. No dependencies. < 50ms."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@router.get("/ready")
async def readiness():
    """Tier 2: Can serve traffic. Critical deps only. 2-5s timeout."""
    db_ok = await check_database(timeout=5)
    return {"status": "ready" if db_ok else "unhealthy"}

@router.get("/health/deep")
async def deep():
    """Tier 3: All dependencies in parallel. For debugging/dashboards."""
    results = await asyncio.gather(check_database(), check_redis(), check_ai())
    return {"dependencies": results}
```

**Why it fails**: Load balancers need a fast liveness check (< 50ms). If liveness includes a slow database check, a healthy process gets killed because the probe times out. Kubernetes restarts pods unnecessarily. Separate tiers let orchestrators make correct decisions.

---

## AP-2: Sequential Dependency Checks

**Severity**: High -- total latency equals sum of all checks.

```python
# BANNED: Sequential checks
async def deep_health():
    db = await check_database()      # 500ms
    redis = await check_redis()      # 200ms
    ai = await check_ai_provider()   # 1000ms
    # Total: 1700ms
    return [db, redis, ai]
```

```python
# CORRECT: Parallel checks
async def deep_health():
    db, redis, ai = await asyncio.gather(
        check_database(),      # 500ms
        check_redis(),         # 200ms
        check_ai_provider(),   # 1000ms
    )
    # Total: 1000ms (max of all)
    return [db, redis, ai]
```

```typescript
// CORRECT (frontend)
const [database, backend, verification] = await Promise.all([
  checkDatabase(),
  checkBackend(),
  checkVerificationSystem(),
]);
```

**Why it fails**: A slow database check should not delay the Redis check. Sequential checks compound latency. With 5 dependencies at 1 second each, sequential takes 5 seconds while parallel takes 1 second.

---

## AP-3: HTTP 200 When Unhealthy

**Severity**: Critical -- load balancers route traffic to broken instances.

```python
# BANNED: 200 OK with unhealthy status in body
@router.get("/health")
async def health():
    db_ok = await check_database()
    return {"status": "unhealthy", "database": "down"}  # HTTP 200!
```

```python
# CORRECT: 503 for unhealthy
@router.get("/health/deep")
async def deep_health():
    checks = await run_all_checks()
    any_unhealthy = any(c.status == "unhealthy" for c in checks)

    status_code = 503 if any_unhealthy else 200
    return JSONResponse(
        status_code=status_code,
        content={"status": "unhealthy" if any_unhealthy else "healthy", "checks": checks},
    )
```

**Why it fails**: Load balancers and Kubernetes read HTTP status codes, not response bodies. A 200 with `"status": "unhealthy"` tells the load balancer the instance is healthy. Traffic continues flowing to a broken instance.

---

## AP-4: No Timeout on Dependency Checks

**Severity**: High -- a single hung dependency blocks the entire health response.

```typescript
// BANNED: No timeout
async function checkDatabase(): Promise<DependencyCheck> {
  const response = await fetch(dbUrl);  // May hang forever
  return { status: response.ok ? 'healthy' : 'unhealthy' };
}
```

```typescript
// CORRECT: 5-second timeout per check
async function checkDatabase(): Promise<DependencyCheck> {
  const start = Date.now();
  try {
    const response = await fetch(dbUrl, {
      signal: AbortSignal.timeout(5000),
    });
    return {
      status: response.ok ? 'healthy' : 'degraded',
      latency_ms: Date.now() - start,
    };
  } catch (e) {
    return {
      status: 'unhealthy',
      latency_ms: Date.now() - start,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}
```

**Why it fails**: A database connection that hangs (TCP half-open, firewall drop) causes the health endpoint to never respond. The load balancer eventually marks the instance as unhealthy, but only after its own timeout (typically 30 seconds), during which time the instance serves no traffic at all.

---

## AP-5: Sensitive Details in Health Response

**Severity**: Medium -- leaks internal architecture to anyone who hits the endpoint.

```json
// BANNED: Internal error details exposed
{
  "status": "unhealthy",
  "database": {
    "error": "connection refused: postgresql://admin:s3cret@10.0.1.5:5432/mydb",
    "stack": "Traceback (most recent call last):\n  File \"/srv/app/..."
  }
}
```

```json
// CORRECT: Status and latency only
{
  "status": "unhealthy",
  "database": {
    "status": "unhealthy",
    "latency_ms": null,
    "error": "Connection failed"
  }
}
```

**Why it fails**: Health endpoints are often unauthenticated (for load balancer access). Internal error messages reveal database hostnames, credentials in connection strings, file paths, and library versions. Log the full error server-side; return only the status classification.

---

## AP-6: Database Query in Liveness Probe

**Severity**: High -- kills healthy processes when the database is slow.

```python
# BANNED: DB check in liveness
@router.get("/health")
async def liveness():
    await db.execute(text("SELECT 1"))  # Fails if DB is slow
    return {"status": "healthy"}
```

```python
# CORRECT: Liveness = process alive only
@router.get("/health")
async def liveness():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
    }
```

**Why it fails**: Liveness probes answer "is the process alive?" -- not "are dependencies available?" If the database is slow (maintenance, high load), the liveness probe fails, and Kubernetes restarts the pod. Restarting does not fix the database. The pod enters a restart loop. Database checks belong in the readiness probe.
