# Error Taxonomy -- Generic Standards

> Portable error classification standards applicable to any project. Framework-agnostic, design-system-agnostic.

---

## Principle

Every runtime error must have a machine-readable code, a severity level, an HTTP status mapping, and a user-facing message. No unstructured error strings in API responses.

---

## Error Code Format

Use a three-part naming convention: `{DOMAIN}_{CATEGORY}_{SPECIFIC}`

- **Domain**: The subsystem (e.g., `AUTH`, `DATA`, `SYS`)
- **Category**: The failure type (e.g., `VALIDATION`, `RUNTIME`, `NOTFOUND`)
- **Specific**: The exact failure (e.g., `EXPIRED_TOKEN`, `MISSING_FIELD`)

Example: `AUTH_VALIDATION_EXPIRED_TOKEN`

---

## Severity Levels

| Level | HTTP Range | Action |
|-------|-----------|--------|
| **Fatal** | 500-599 | Log, alert, escalate |
| **Error** | 400-499 | Log, return user message |
| **Warning** | 200 with warning | Log only |

---

## Standard Error Response

Every API error response should include:

| Field | Type | Description |
|-------|------|-------------|
| `detail` | string | Human-readable error message |
| `error_code` | string | Machine-readable code in `DOMAIN_CATEGORY_SPECIFIC` format |
| `severity` | enum | `fatal`, `error`, or `warning` |
| `field` | string (optional) | Specific field that caused a validation error |

```json
{
  "detail": "Token has expired. Please log in again.",
  "error_code": "AUTH_VALIDATION_EXPIRED_TOKEN",
  "severity": "error",
  "field": null
}
```

---

## User-Facing Message Rules

- Every error code must map to a user-facing message
- Messages should tell the user what happened and what to do next
- Never expose internal error details, stack traces, or SQL queries
- Use consistent, professional tone

---

## Error Classification Helpers

Implement convenience methods on the client-side error class:

| Method | Logic | Purpose |
|--------|-------|---------|
| `isAuth` | Code starts with `AUTH_` | Trigger re-authentication flow |
| `isValidation` | Code contains `_VALIDATION_` | Highlight specific form field |
| `isRetryable` | HTTP 429 or 500+ | Enable retry with backoff |

---

## Adding New Error Codes

1. Identify the domain subsystem
2. Identify the failure category
3. Create a descriptive specific identifier
4. Register in the error code registry
5. Map a user-facing message on the frontend
6. Use the standard error response model in the API

---

## Checklist

- [ ] Error codes follow `DOMAIN_CATEGORY_SPECIFIC` format
- [ ] User-facing messages defined for every error code
- [ ] HTTP status codes mapped correctly per severity
- [ ] Frontend error class matches backend error response contract
- [ ] No sensitive data (stack traces, SQL, internal paths) in error responses
