# Error Taxonomy -- Scientific Luxury Standards

> Domain-specific error classification standards for NodeJS-Starter-V1. Every error has a code, category, severity, and user-facing message. Backend: FastAPI ErrorResponse model. Frontend: ApiClientError class.

---

## Error Code Format

All error codes follow: `{DOMAIN}_{CATEGORY}_{SPECIFIC}`

```
AUTH_VALIDATION_INVALID_TOKEN
AGENT_RUNTIME_TIMEOUT
DATA_VALIDATION_MISSING_FIELD
SYS_EXTERNAL_DATABASE
```

---

## Domain Registry

| Domain | Prefix | Scope |
|--------|--------|-------|
| Authentication | `AUTH_` | Login, JWT, permissions |
| Agent | `AGENT_` | AI agent execution, LLM providers |
| Data | `DATA_` | Validation, transformation, storage |
| Workflow | `WORKFLOW_` | Pipeline, state machine, scheduling |
| System | `SYS_` | Infrastructure, database, external services |

---

## Category Registry

| Category | Suffix | Meaning |
|----------|--------|---------|
| Validation | `_VALIDATION_` | Input/schema validation failure |
| Runtime | `_RUNTIME_` | Unexpected runtime failure |
| Permission | `_PERMISSION_` | Authorisation or access denied |
| NotFound | `_NOTFOUND_` | Resource does not exist |
| Conflict | `_CONFLICT_` | State conflict or duplicate |
| RateLimit | `_RATELIMIT_` | Throttled request |
| External | `_EXTERNAL_` | Third-party service failure |

---

## Severity Mapping

| Level | HTTP Range | Action |
|-------|-----------|--------|
| **Fatal** | 500-599 | Log + alert + escalate |
| **Error** | 400-499 | Log + return user message |
| **Warning** | 200 with warning header | Log only |

---

## Error Code Registry

### Authentication Errors

| Code | HTTP | User Message |
|------|------|-------------|
| `AUTH_VALIDATION_INVALID_TOKEN` | 401 | Your session is invalid. Please sign in again. |
| `AUTH_VALIDATION_EXPIRED_TOKEN` | 401 | Your session has expired. Please sign in again. |
| `AUTH_VALIDATION_MISSING_TOKEN` | 401 | Please sign in to continue. |
| `AUTH_PERMISSION_DENIED` | 403 | You do not have permission to perform this action. |
| `AUTH_PERMISSION_INACTIVE` | 403 | Your account has been deactivated. |
| `AUTH_PERMISSION_NOT_ADMIN` | 403 | Admin access required. |
| `AUTH_NOTFOUND_USER` | 404 | User not found. |

### Agent Errors

| Code | HTTP | User Message |
|------|------|-------------|
| `AGENT_RUNTIME_TIMEOUT` | 504 | The AI agent took too long to respond. Please try again. |
| `AGENT_RUNTIME_FAILED` | 500 | The AI agent encountered an error. Please try again. |
| `AGENT_EXTERNAL_PROVIDER_DOWN` | 503 | The AI service is temporarily unavailable. |
| `AGENT_VALIDATION_INVALID_INPUT` | 422 | Invalid input for the AI agent. |
| `AGENT_NOTFOUND_TYPE` | 404 | Unknown agent type. |

### Data Errors

| Code | HTTP | User Message |
|------|------|-------------|
| `DATA_VALIDATION_MISSING_FIELD` | 422 | Please fill in all required fields. |
| `DATA_VALIDATION_INVALID_FORMAT` | 422 | Invalid data format. |
| `DATA_NOTFOUND_DOCUMENT` | 404 | Document not found. |
| `DATA_NOTFOUND_CONTRACTOR` | 404 | Contractor not found. |
| `DATA_CONFLICT_DUPLICATE` | 409 | This resource already exists. |

### System Errors

| Code | HTTP | User Message |
|------|------|-------------|
| `SYS_EXTERNAL_DATABASE` | 500 | A database error occurred. Please try again later. |
| `SYS_EXTERNAL_REDIS` | 500 | A cache service error occurred. Please try again later. |
| `SYS_RATELIMIT_EXCEEDED` | 429 | Too many requests. Please wait a moment. |
| `SYS_RUNTIME_INTERNAL` | 500 | An internal error occurred. Please try again later. |

---

## Backend ErrorResponse Model

```python
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ErrorSeverity(str, Enum):
    FATAL = "fatal"
    ERROR = "error"
    WARNING = "warning"


class ErrorResponse(BaseModel):
    """Canonical error response for all API endpoints."""
    detail: str = Field(..., description="Human-readable error message")
    error_code: str = Field(..., description="Machine-readable error code")
    severity: ErrorSeverity = Field(default=ErrorSeverity.ERROR)
    field: Optional[str] = Field(None, description="Field that caused the error")
```

---

## Frontend ApiClientError Class

```typescript
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode: string,
    public severity: 'fatal' | 'error' | 'warning' = 'error',
    public field?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  get isAuth(): boolean {
    return this.errorCode.startsWith('AUTH_');
  }

  get isValidation(): boolean {
    return this.errorCode.includes('_VALIDATION_');
  }

  get isRetryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}
```

---

## Adding New Error Codes

1. Choose domain from the Domain Registry
2. Choose category from the Category Registry
3. Add specific identifier describing the failure
4. Register in the Error Code Registry above
5. Map a user-facing message in the frontend `ERROR_MESSAGES` record
6. Use the `ErrorResponse` model when raising `HTTPException`
