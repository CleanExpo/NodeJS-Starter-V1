# Structured Logging -- Scientific Luxury Standards

> Domain-specific standards for JSON-structured logging in NodeJS-Starter-V1. Backend: structlog with JSONRenderer. Frontend: custom Logger class. All logs carry correlation IDs.

---

## Log Format

### Production JSON Schema

Every log line in production is a single JSON object:

```json
{
  "timestamp": "2026-02-13T09:30:00.000Z",
  "level": "info",
  "event": "Request completed",
  "logger": "src.api.middleware.logging",
  "correlation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "method": "POST",
  "path": "/api/documents",
  "status": 201,
  "duration_ms": 42.5
}
```

### Debug Console Format

In development, structlog uses `ConsoleRenderer()` for human-readable output. The Logger class on the frontend uses ISO timestamps with JSON context serialisation.

---

## Required Fields

Every log entry must include these fields (automatically via middleware or manually):

| Field | Source | Example | Required |
|-------|--------|---------|----------|
| `timestamp` | Auto (structlog/Logger) | `2026-02-13T09:30:00.000Z` | Yes |
| `level` | Auto | `info`, `error`, `warn`, `debug` | Yes |
| `event` | First argument to logger call | `"Document created"` | Yes |
| `correlation_id` | CorrelationIdMiddleware | `"a1b2c3d4-..."` | Yes (request-scoped) |
| `logger` | `get_logger(__name__)` | `"src.api.routes.documents"` | Yes (backend) |

---

## Recommended Fields by Domain

| Domain | Fields | Example |
|--------|--------|---------|
| API requests | `method`, `path`, `status`, `duration_ms` | `method="POST", path="/api/documents", status=201, duration_ms=42.5` |
| Authentication | `user_id`, `action` | `user_id="uuid", action="login"` |
| Agent execution | `agent`, `task` (truncated to 100 chars), `status`, `duration_ms` | `agent="researcher", status="success", duration_ms=1500` |
| Database operations | `table`, `operation`, `row_count` | `table="documents", operation="insert", row_count=1` |
| External services | `service`, `endpoint`, `status`, `duration_ms` | `service="openai", endpoint="/v1/chat", status=200, duration_ms=800` |

---

## Correlation ID Protocol

### Generation

The `CorrelationIdMiddleware` generates a UUID v4 per request, or accepts one from the `X-Correlation-ID` header:

```python
correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
structlog.contextvars.bind_contextvars(correlation_id=correlation_id)
```

### Propagation

- Backend: Automatically bound to all structlog loggers in the request via `contextvars`
- Response: Returned in the `X-Correlation-ID` response header
- Frontend: Captured from response headers and forwarded on subsequent requests

### Tracing Flow

```
Frontend request
  -> X-Correlation-ID: (generated or forwarded)
  -> Backend middleware binds to structlog context
  -> All backend logs include correlation_id
  -> Response: X-Correlation-ID header
  -> Frontend captures and reuses
```

---

## Backend Setup (structlog)

### Configuration Location

`apps/backend/src/utils/logging.py`

- **Debug mode**: `ConsoleRenderer()` (human-readable)
- **Production mode**: `JSONRenderer()` (machine-readable)
- **Context vars**: `merge_contextvars` enables request-scoped context

### Logger Acquisition

```python
from src.utils import get_logger

logger = get_logger(__name__)
# Logger name becomes the "logger" field: "src.api.routes.documents"
```

---

## Frontend Setup (Logger)

### Configuration Location

`apps/web/lib/logger.ts`

- Level filtering via `LOG_LEVEL` environment variable
- ISO timestamp formatting
- JSON context serialisation

### Logger Acquisition

```typescript
import { logger } from '@/lib/logger';

logger.info('Document created', { documentId: doc.id, userId: user.id });
```

---

## Log Level Guidelines

| Level | Production Visible | Use Case |
|-------|--------------------|----------|
| **ERROR** | Yes | Operation failed, needs attention |
| **WARNING** | Yes | Recoverable issue, degraded behaviour |
| **INFO** | Yes | Significant business events |
| **DEBUG** | No (filtered) | Development detail, query params |

---

## Sensitive Data Redaction

### Never Log

- Passwords, tokens, API keys, session IDs
- Full request/response bodies
- Personal information beyond debugging needs
- High-frequency events without sampling

### Error Logs

Error logs must include `error_code` from the error-taxonomy skill:

```python
logger.error("Agent failed", error_code="AGENT_RUNTIME_FAILED", agent=name)
```

---

## Shannon Compression Principle

- Log messages must be concise -- maximum signal, minimum noise
- Avoid logging the same event at multiple levels
- Use sampling for high-frequency events (e.g., log 1 in 100 health checks)
- Truncate large values (task descriptions to 100 chars, stack traces to relevant frames)

---

## Localisation (en-AU)

- **Timestamps**: ISO 8601 (UTC) in log output, DD/MM/YYYY in human reports
- **Spelling**: behaviour, colour, organisation, analyse, centre, serialisation
- **Compliance**: Logs must not contain data subject to Privacy Act 1988 (Cth) without justification
