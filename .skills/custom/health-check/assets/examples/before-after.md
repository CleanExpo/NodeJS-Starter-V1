# Health Check -- Before/After Examples

> Concrete transformations from anti-patterns to three-tier health architecture.

---

## Example 1: Single Endpoint to Three Tiers

### Before

```python
@router.get("/health")
async def health():
    """One endpoint that checks everything sequentially."""
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    try:
        await redis.ping()
        redis_ok = True
    except Exception:
        redis_ok = False

    all_ok = db_ok and redis_ok
    return {"status": "ok" if all_ok else "error", "database": db_ok, "redis": redis_ok}
```

**Problems**: Liveness check includes database (kills healthy process during DB maintenance). Sequential checks compound latency. Returns 200 even when unhealthy. Single tier conflates three concerns.

### After

```python
@router.get("/health")
async def liveness():
    """Tier 1: Process alive. No deps. < 50ms."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat(), "version": "0.1.0"}


@router.get("/ready")
async def readiness():
    """Tier 2: Can serve traffic. Critical deps with timeout."""
    db, redis = await asyncio.gather(_check_database(), _check_redis())
    checks = [db, redis]
    any_unhealthy = any(c["status"] == "unhealthy" for c in checks)

    return JSONResponse(
        status_code=503 if any_unhealthy else 200,
        content={"status": "unhealthy" if any_unhealthy else "ready", "dependencies": checks},
    )


@router.get("/health/deep")
async def deep():
    """Tier 3: All deps in parallel. For dashboards and debugging."""
    checks = await asyncio.gather(
        _check_database(), _check_redis(), _check_ai_provider(),
    )
    any_unhealthy = any(c["status"] == "unhealthy" for c in checks)
    return JSONResponse(
        status_code=503 if any_unhealthy else 200,
        content={"status": "unhealthy" if any_unhealthy else "healthy", "dependencies": checks},
    )
```

---

## Example 2: Sequential to Parallel

### Before

```typescript
async function deepHealth() {
  const db = await checkDatabase();       // 500ms
  const redis = await checkRedis();       // 200ms
  const backend = await checkBackend();   // 800ms
  // Total: 1500ms sequential
  return [db, redis, backend];
}
```

### After

```typescript
async function deepHealth() {
  const [db, redis, backend] = await Promise.all([
    checkDatabase(),    // 500ms
    checkRedis(),       // 200ms
    checkBackend(),     // 800ms
  ]);
  // Total: 800ms (max of all)
  return [db, redis, backend];
}
```

---

## Example 3: 200 OK When Unhealthy to Correct Status Codes

### Before

```typescript
export async function GET() {
  const checks = await runAllChecks();
  // Always returns 200, even when database is down
  return NextResponse.json({ status: 'ok', checks });
}
```

### After

```typescript
export async function GET() {
  const checks = await runAllChecks();
  const anyUnhealthy = checks.some((c) => c.status === 'unhealthy');

  return NextResponse.json(
    {
      status: anyUnhealthy ? 'unhealthy' : 'healthy',
      checks,
    },
    { status: anyUnhealthy ? 503 : 200 },
  );
}
```

---

## Example 4: No Timeout to Bounded Checks

### Before

```typescript
async function checkDatabase(): Promise<DependencyCheck> {
  const response = await fetch(dbUrl);  // May hang indefinitely
  return { name: 'database', status: response.ok ? 'healthy' : 'unhealthy' };
}
```

### After

```typescript
async function checkDatabase(): Promise<DependencyCheck> {
  const start = Date.now();
  try {
    const response = await fetch(dbUrl, {
      signal: AbortSignal.timeout(5000),  // 5-second hard limit
    });
    return {
      name: 'database',
      status: response.ok ? 'healthy' : 'degraded',
      latency_ms: Date.now() - start,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (e) {
    return {
      name: 'database',
      status: 'unhealthy',
      latency_ms: Date.now() - start,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}
```

---

## Example 5: Sensitive Details to Safe Responses

### Before

```json
{
  "database": {
    "error": "connection refused: postgresql://admin:s3cret@10.0.1.5:5432/mydb",
    "stack": "Traceback (most recent call last):\n  File \"/srv/app/..."
  }
}
```

### After

```json
{
  "database": {
    "name": "database",
    "status": "unhealthy",
    "latency_ms": null,
    "error": "Connection failed"
  }
}
```

Full error details logged server-side only:

```python
logger.error("Database health check failed", error=str(exc), host=db_host)
```
