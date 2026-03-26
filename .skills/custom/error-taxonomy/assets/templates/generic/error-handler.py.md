# Python Error Handler Template -- Generic

> Framework-agnostic error response model and structured error raising. Portable to any Python API.

---

## Error Response Model

```python
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ErrorSeverity(str, Enum):
    FATAL = "fatal"
    ERROR = "error"
    WARNING = "warning"


class ErrorResponse(BaseModel):
    """Standard error response for API endpoints."""
    detail: str = Field(..., description="Human-readable error message")
    error_code: str = Field(..., description="Machine-readable error code")
    severity: ErrorSeverity = Field(default=ErrorSeverity.ERROR)
    field: Optional[str] = Field(None, description="Field causing validation error")
```

---

## Error Raising Helpers

```python
from fastapi import HTTPException


def raise_error(status_code: int, error_code: str, detail: str, field: str | None = None) -> None:
    """Raise an HTTP error with structured response."""
    raise HTTPException(
        status_code=status_code,
        detail=ErrorResponse(
            detail=detail,
            error_code=error_code,
            field=field,
        ).model_dump(),
    )
```

---

## Validation Exception Handler

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError


async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append({
            "detail": error["msg"],
            "error_code": f"DATA_VALIDATION_{error['type'].upper()}",
            "severity": "error",
            "field": field,
        })
    return JSONResponse(status_code=422, content={"errors": errors})
```

---

## Usage

```python
# Raise a structured error
raise_error(401, "AUTH_VALIDATION_EXPIRED_TOKEN", "Token has expired. Please log in again.")
raise_error(404, "DATA_NOTFOUND_DOCUMENT", "Document not found.")
raise_error(422, "DATA_VALIDATION_MISSING_FIELD", "Title is required.", field="title")
```
