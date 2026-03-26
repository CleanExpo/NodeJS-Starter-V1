# Python Health Routes Template -- Generic

> Framework-agnostic three-tier health endpoints. Adaptable to FastAPI, Flask, or any ASGI/WSGI framework.

---

## Health Routes

```python
import asyncio
import time
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["health"])


@router.get("/health")
async def liveness() -> dict:
    """Tier 1: Liveness. No dependencies. < 50ms."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }


@router.get("/ready")
async def readiness() -> JSONResponse:
    """Tier 2: Readiness. Critical dependencies with timeout."""
    checks = await asyncio.gather(
        check_dependency("database", _ping_database),
        check_dependency("cache", _ping_cache),
    )
    any_unhealthy = any(c["status"] == "unhealthy" for c in checks)
    return JSONResponse(
        status_code=503 if any_unhealthy else 200,
        content={
            "status": "unhealthy" if any_unhealthy else "ready",
            "timestamp": datetime.now().isoformat(),
            "dependencies": checks,
        },
    )


@router.get("/health/deep")
async def deep() -> JSONResponse:
    """Tier 3: Deep check. All dependencies in parallel."""
    checks = await asyncio.gather(
        check_dependency("database", _ping_database),
        check_dependency("cache", _ping_cache),
        check_dependency("external_api", _ping_external),
    )
    any_unhealthy = any(c["status"] == "unhealthy" for c in checks)
    any_degraded = any(c["status"] == "degraded" for c in checks)
    overall = "unhealthy" if any_unhealthy else "degraded" if any_degraded else "healthy"

    return JSONResponse(
        status_code=503 if any_unhealthy else 200,
        content={
            "status": overall,
            "timestamp": datetime.now().isoformat(),
            "dependencies": checks,
            "summary": {
                "total": len(checks),
                "passed": sum(1 for c in checks if c["status"] == "healthy"),
                "failed": sum(1 for c in checks if c["status"] == "unhealthy"),
                "degraded": sum(1 for c in checks if c["status"] == "degraded"),
            },
        },
    )


async def check_dependency(name: str, check_fn) -> dict:
    """Run a dependency check with 5-second timeout and latency measurement."""
    start = time.perf_counter()
    try:
        await asyncio.wait_for(check_fn(), timeout=5.0)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {"name": name, "status": "healthy", "latency_ms": latency_ms, "error": None}
    except asyncio.TimeoutError:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {"name": name, "status": "unhealthy", "latency_ms": latency_ms, "error": "Timeout"}
    except Exception as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {"name": name, "status": "unhealthy", "latency_ms": latency_ms, "error": str(e)}


async def _ping_database():
    """Replace with your database ping logic."""
    pass


async def _ping_cache():
    """Replace with your cache ping logic."""
    pass


async def _ping_external():
    """Replace with your external API ping logic."""
    pass
```
