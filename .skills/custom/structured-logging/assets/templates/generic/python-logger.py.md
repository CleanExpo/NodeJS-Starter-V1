# Python Logger Template -- Generic

> Framework-agnostic structured logging setup using structlog. JSON output in production, console in development.

---

## Logger Configuration

```python
import logging
import os
import structlog


def configure_logging() -> None:
    """Configure structlog with JSON (production) or console (development) output."""
    debug = os.getenv("DEBUG", "false").lower() == "true"

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if debug:
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
    root_logger.setLevel(logging.DEBUG if debug else logging.INFO)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Acquire a named logger."""
    return structlog.get_logger(name)
```

---

## Usage

```python
from my_project.logging import get_logger

logger = get_logger(__name__)

# Structured key-value context
logger.info("User created", user_id=user.id, role=user.role)
logger.warning("Rate limit approaching", current=95, limit=100)
logger.error("Database query failed", error_code="DB_CONNECTION_LOST", table="users")
logger.debug("Query parameters", params={"page": 1, "limit": 20})
```

---

## Correlation ID Middleware (ASGI)

```python
import uuid
import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4()),
        )
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
```
