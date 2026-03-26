# Python Logger Template -- Scientific Luxury

> structlog setup with correlation middleware for NodeJS-Starter-V1. JSON output in production, console in development.

---

## Logger Configuration

```python
# apps/backend/src/utils/logging.py
import logging
import structlog

from src.config import settings


def configure_logging() -> None:
    """Configure structlog with JSON (production) or console (development) output."""
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if settings.DEBUG:
        renderer = structlog.dev.ConsoleRenderer()
    else:
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[*shared_processors, renderer],
    )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Acquire a named logger. Name becomes the 'logger' field in JSON output."""
    return structlog.get_logger(name)
```

---

## Correlation ID Middleware

```python
# apps/backend/src/api/middleware/correlation.py
import uuid
import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Attach a correlation ID to every request for log tracing."""

    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4()),
        )

        # Bind to structlog context (available to all loggers in this request)
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            correlation_id=correlation_id,
        )

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
```

---

## Request Logging Middleware

```python
# apps/backend/src/api/middleware/request_logging.py
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from src.utils import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log request method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        logger.info(
            "Request completed",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=round(duration_ms, 2),
        )
        return response
```

---

## Registration

```python
# apps/backend/src/api/main.py
from .middleware.correlation import CorrelationIdMiddleware
from .middleware.request_logging import RequestLoggingMiddleware

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CorrelationIdMiddleware)
```

---

## Usage Pattern

```python
from src.utils import get_logger

logger = get_logger(__name__)

# Business events
logger.info("Document created", document_id=doc.id, user_id=user.id)

# Warnings
logger.warning("Rate limit approaching", current=current, limit=limit)

# Errors with error-taxonomy codes
logger.error("Agent failed", error_code="AGENT_RUNTIME_FAILED", agent=name)

# Debug (filtered in production)
logger.debug("Query parameters", params=dict(request.query_params))
```
