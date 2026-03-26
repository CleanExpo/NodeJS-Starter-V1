# Python Error Handler Template -- Scientific Luxury

> ErrorResponse model, validation handler, and structured error raising for NodeJS-Starter-V1 FastAPI backend.

---

## ErrorResponse Model

```python
# apps/backend/src/models/errors.py
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
    severity: ErrorSeverity = Field(
        default=ErrorSeverity.ERROR,
        description="Error severity level",
    )
    field: Optional[str] = Field(
        None,
        description="Specific field that caused the error (validation)",
    )
```

---

## Structured Error Raising

```python
# Usage in route handlers
from fastapi import HTTPException, status
from src.models.errors import ErrorResponse, ErrorSeverity


def raise_auth_error(code: str, detail: str) -> None:
    """Raise an authentication error with structured response."""
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=ErrorResponse(
            detail=detail,
            error_code=code,
            severity=ErrorSeverity.ERROR,
        ).model_dump(),
    )


def raise_not_found(code: str, detail: str) -> None:
    """Raise a not-found error with structured response."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=ErrorResponse(
            detail=detail,
            error_code=code,
        ).model_dump(),
    )


def raise_validation_error(code: str, detail: str, field: str) -> None:
    """Raise a validation error with field reference."""
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=ErrorResponse(
            detail=detail,
            error_code=code,
            field=field,
        ).model_dump(),
    )


# Example usage
raise_auth_error(
    "AUTH_VALIDATION_EXPIRED_TOKEN",
    "Token has expired. Please log in again.",
)
```

---

## Global Validation Exception Handler

```python
# apps/backend/src/api/exception_handlers.py
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError


async def validation_exception_handler(
    request: Request,
    exc: ValidationError,
) -> JSONResponse:
    """Convert Pydantic ValidationError into structured ErrorResponse list."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append({
            "detail": error["msg"],
            "error_code": f"DATA_VALIDATION_{error['type'].upper()}",
            "severity": "error",
            "field": field,
        })
    return JSONResponse(
        status_code=422,
        content={"errors": errors},
    )
```

---

## Registration

```python
# apps/backend/src/api/main.py
from pydantic import ValidationError
from src.api.exception_handlers import validation_exception_handler

app.add_exception_handler(ValidationError, validation_exception_handler)
```

---

## Usage in Agent Execution

```python
from src.utils import get_logger
from src.models.errors import ErrorResponse, ErrorSeverity

logger = get_logger(__name__)


async def execute_agent(agent_name: str, task: str):
    try:
        result = await agent.run(task)
        return result
    except TimeoutError:
        logger.error("Agent timed out", error_code="AGENT_RUNTIME_TIMEOUT", agent=agent_name)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=ErrorResponse(
                detail="The AI agent took too long to respond. Please try again.",
                error_code="AGENT_RUNTIME_TIMEOUT",
                severity=ErrorSeverity.FATAL,
            ).model_dump(),
        )
    except Exception as exc:
        logger.error("Agent failed", error_code="AGENT_RUNTIME_FAILED", agent=agent_name, error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                detail="The AI agent encountered an error. Please try again.",
                error_code="AGENT_RUNTIME_FAILED",
                severity=ErrorSeverity.FATAL,
            ).model_dump(),
        )
```
