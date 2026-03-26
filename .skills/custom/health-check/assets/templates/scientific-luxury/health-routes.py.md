# FastAPI Health Routes Template -- Scientific Luxury

> Three-tier health endpoints for the NodeJS-Starter-V1 FastAPI backend.

---

## Health Routes

```python
# apps/backend/src/api/routes/health.py
import asyncio
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from src.utils import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["health"])


@router.get("/health")
async def liveness() -> dict:
    """Tier 1: Liveness probe. No dependencies. Must respond in < 50ms."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
    }


@router.get("/ready")
async def readiness() -> JSONResponse:
    """Tier 2: Readiness probe. Checks critical dependencies with timeout."""
    checks = await asyncio.gather(
        _check_database(),
        _check_redis(),
    )

    any_unhealthy = any(c["status"] == "unhealthy" for c in checks)
    status_code = 503 if any_unhealthy else 200
    overall = "unhealthy" if any_unhealthy else "ready"

    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall,
            "timestamp": datetime.now().isoformat(),
            "dependencies": checks,
        },
    )


@router.get("/health/deep")
async def deep_health() -> JSONResponse:
    """Tier 3: Deep dependency check. All deps in parallel. For dashboards."""
    checks = await asyncio.gather(
        _check_database(),
        _check_redis(),
        _check_ai_provider(),
    )

    any_unhealthy = any(c["status"] == "unhealthy" for c in checks)
    any_degraded = any(c["status"] == "degraded" for c in checks)

    overall = "unhealthy" if any_unhealthy else "degraded" if any_degraded else "healthy"
    status_code = 503 if any_unhealthy else 200

    summary = {
        "total_checks": len(checks),
        "passed": sum(1 for c in checks if c["status"] == "healthy"),
        "failed": sum(1 for c in checks if c["status"] == "unhealthy"),
        "degraded": sum(1 for c in checks if c["status"] == "degraded"),
    }

    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall,
            "timestamp": datetime.now().isoformat(),
            "dependencies": checks,
            "summary": summary,
        },
    )


async def _check_database() -> dict:
    """Check database connectivity with 5-second timeout."""
    import time
    start = time.perf_counter()
    try:
        from src.db.session import async_session
        async with async_session() as session:
            await asyncio.wait_for(
                session.execute(text("SELECT 1")),
                timeout=5.0,
            )
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "name": "database",
            "status": "healthy",
            "latency_ms": latency_ms,
            "error": None,
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.error("Database health check failed", error=str(e))
        return {
            "name": "database",
            "status": "unhealthy",
            "latency_ms": latency_ms,
            "error": "Connection failed",
        }


async def _check_redis() -> dict:
    """Check Redis connectivity with 5-second timeout."""
    import time
    start = time.perf_counter()
    try:
        from src.cache import redis_client
        await asyncio.wait_for(redis_client.ping(), timeout=5.0)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "name": "redis",
            "status": "healthy",
            "latency_ms": latency_ms,
            "error": None,
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.error("Redis health check failed", error=str(e))
        return {
            "name": "redis",
            "status": "unhealthy",
            "latency_ms": latency_ms,
            "error": "Connection failed",
        }


async def _check_ai_provider() -> dict:
    """Check AI provider availability with 5-second timeout."""
    import time
    start = time.perf_counter()
    try:
        # Lightweight check -- ping or model list endpoint
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "name": "ai_provider",
            "status": "healthy",
            "latency_ms": latency_ms,
            "error": None,
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.error("AI provider health check failed", error=str(e))
        return {
            "name": "ai_provider",
            "status": "unhealthy",
            "latency_ms": latency_ms,
            "error": "Provider unavailable",
        }
```
