# Error Taxonomy -- Anti-Patterns

> Banned patterns extracted from the error-taxonomy skill. Every violation breaks frontend error handling, leaks internal details, or creates inconsistent user experiences.

---

## AP-1: Unstructured Error Strings

**Severity**: High -- prevents machine-readable error handling on the frontend.

```python
# BANNED
raise HTTPException(status_code=401, detail="Invalid token")
raise HTTPException(status_code=422, detail="bad input")
raise HTTPException(status_code=500, detail="something went wrong")

# CORRECT
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail=ErrorResponse(
        detail="Token has expired. Please log in again.",
        error_code="AUTH_VALIDATION_EXPIRED_TOKEN",
    ).model_dump(),
)
```

**Why it fails**: Unstructured strings force the frontend into brittle string-matching (`if detail.includes("token")`). The `ErrorResponse` model with `error_code` enables deterministic handling: `if (error.errorCode.startsWith('AUTH_'))`.

---

## AP-2: Inconsistent Error Codes

**Severity**: High -- breaks the `DOMAIN_CATEGORY_SPECIFIC` naming convention.

```python
# BANNED: Ad-hoc naming
error_code="AUTH_BAD_TOKEN"        # Missing category
error_code="INVALID_TOKEN"         # Missing domain
error_code="auth_validation_token" # Wrong case, missing specific
error_code="TOKEN_EXPIRED"         # No domain, no category

# CORRECT: Three-part format
error_code="AUTH_VALIDATION_INVALID_TOKEN"
error_code="AUTH_VALIDATION_EXPIRED_TOKEN"
error_code="AGENT_RUNTIME_TIMEOUT"
error_code="DATA_VALIDATION_MISSING_FIELD"
```

**Format**: `{DOMAIN}_{CATEGORY}_{SPECIFIC}`

| Part | Options |
|------|---------|
| Domain | `AUTH_`, `AGENT_`, `DATA_`, `WORKFLOW_`, `SYS_` |
| Category | `_VALIDATION_`, `_RUNTIME_`, `_PERMISSION_`, `_NOTFOUND_`, `_CONFLICT_`, `_RATELIMIT_`, `_EXTERNAL_` |
| Specific | Descriptive identifier for the failure mode |

**Why it fails**: Inconsistent codes break automated error routing, frontend error-message mapping, and monitoring dashboards. The three-part format encodes domain, category, and failure mode in a single parseable string.

---

## AP-3: Missing User-Facing Messages

**Severity**: Medium -- exposes raw technical error text to users.

```typescript
// BANNED: No message mapping -- user sees "AUTH_VALIDATION_EXPIRED_TOKEN"
catch (error) {
  if (error instanceof ApiClientError) {
    toast.error(error.errorCode);  // Shows raw code to user
  }
}

// CORRECT: Map every error code to a human-readable message
const ERROR_MESSAGES: Record<string, string> = {
  AUTH_VALIDATION_EXPIRED_TOKEN: 'Your session has expired. Please sign in again.',
  AGENT_RUNTIME_TIMEOUT: 'The AI agent took too long to respond. Please try again.',
  SYS_RATELIMIT_EXCEEDED: 'Too many requests. Please wait a moment.',
};

catch (error) {
  if (error instanceof ApiClientError) {
    toast.error(getUserMessage(error));  // Shows friendly message
  }
}
```

**Why it fails**: Users seeing `AUTH_VALIDATION_EXPIRED_TOKEN` or `Internal server error` cannot take meaningful action. Every error code must map to a message that tells the user what happened and what to do next.

---

## AP-4: Sensitive Data in Error Responses

**Severity**: Critical -- leaks internal architecture, database details, or user data.

```python
# BANNED: Stack trace in error detail
raise HTTPException(
    status_code=500,
    detail=f"Database error: {traceback.format_exc()}",
)

# BANNED: SQL query in error detail
raise HTTPException(
    status_code=500,
    detail=f"Query failed: SELECT * FROM users WHERE email = '{email}'",
)

# BANNED: Internal path in error detail
raise HTTPException(
    status_code=500,
    detail=f"File not found: /srv/app/src/services/agent.py",
)

# CORRECT: Generic user message, details logged server-side
logger.error("Database query failed", error=str(exc), table="users")
raise HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail=ErrorResponse(
        detail="A database error occurred. Please try again later.",
        error_code="SYS_EXTERNAL_DATABASE",
        severity=ErrorSeverity.FATAL,
    ).model_dump(),
)
```

**Why it fails**: Error responses are visible to anyone with browser dev tools. Stack traces reveal internal file paths, library versions, and query patterns. SQL in errors enables SQL injection reconnaissance. Always log details server-side and return only the user-facing message and error code.
