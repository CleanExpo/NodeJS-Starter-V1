# Structured Logging -- Generic Standards

> Portable structured logging standards applicable to any project. Framework-agnostic, design-system-agnostic.

---

## Principle

All log output must be machine-parseable JSON in production. Human-readable console output is permitted in development only. Every log entry carries a correlation ID for distributed tracing.

---

## Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `timestamp` | ISO 8601 UTC | `2026-02-13T09:30:00.000Z` |
| `level` | Log severity | `info`, `error`, `warn`, `debug` |
| `event` | Human-readable event description | `"Request completed"` |
| `correlation_id` | Request-scoped trace identifier | `"a1b2c3d4-e5f6-..."` |
| `logger` | Module/class that produced the log | `"api.routes.documents"` |

---

## Log Level Definitions

| Level | When to Use | Alert? |
|-------|-------------|--------|
| **ERROR** | Operation failed, requires attention | Yes |
| **WARNING** | Recoverable issue, degraded behaviour | Monitor |
| **INFO** | Significant business events | No |
| **DEBUG** | Development-only detail | No (filtered in production) |

---

## Structured Key-Value Pairs

Always pass context as key-value pairs, never as interpolated strings:

```
GOOD: log("User logged in", user_id="abc", method="password")
BAD:  log(f"User abc logged in via password")
```

Key-value pairs enable filtering (`WHERE user_id = 'abc'`), aggregation (`COUNT BY method`), and alerting (`WHERE level = 'error' AND service = 'auth'`).

---

## Correlation IDs

- Generate a UUID v4 per inbound request at the API gateway or first middleware
- Propagate via a standard header (e.g., `X-Correlation-ID` or `X-Request-ID`)
- Bind to the logging context so all downstream logs include the ID automatically
- Return the correlation ID in the response header for frontend tracing

---

## Sensitive Data Rules

### Never Log

- Passwords, tokens, API keys, session cookies
- Full request/response bodies (log content-length or summary instead)
- Personal information without business justification
- Credit card numbers, SSNs, or health records

### Redaction Strategy

- Strip `Authorization` headers before logging request metadata
- Truncate large payloads to size indicators
- Mask PII fields if logging is required for debugging (e.g., `email: "j***@example.com"`)

---

## Performance Guidelines

- High-frequency events (heartbeats, health checks) should use DEBUG level or sampling
- Log calls should not block request processing -- use async writers where available
- Avoid logging inside tight loops
- Truncate large context values (stack traces, task descriptions) to relevant portions

---

## Checklist for New Modules

- [ ] Logger acquired via the project's standard factory (not `print` or `console.log`)
- [ ] Structured key-value context, not interpolated strings
- [ ] Correct log level per the level definitions table
- [ ] No secrets, tokens, or passwords in log output
- [ ] Correlation ID available in request-scoped logs
- [ ] Error logs include a machine-readable error code
