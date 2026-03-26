---
template: fastapi-route
variant: scientific-luxury
locale: en-AU
design-system: scientific-luxury
---

# FastAPI route template — Scientific Luxury

```python
"""
{Module description — one line explaining the domain this route serves.}

Routes:
    POST /api/{resource}     — Create a new {resource}
    GET  /api/{resource}/{id} — Retrieve a specific {resource} by ID
    GET  /api/{resource}     — List {resources} with pagination
"""

from __future__ import annotations

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.jwt import get_current_user
from src.db.session import get_db_session

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/{resource}", tags=["{resource}"])


# --- Request/Response models ---


class Create{Resource}Request(BaseModel):
    """Validated input for creating a new {resource}."""

    name: str = Field(..., min_length=1, max_length=255, description="Display name for the {resource}")
    description: str | None = Field(None, max_length=1000, description="Optional description")


class {Resource}Response(BaseModel):
    """Public representation of a {resource}."""

    id: str
    name: str
    description: str | None
    status: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class {Resource}ListResponse(BaseModel):
    """Paginated list of {resources}."""

    items: list[{Resource}Response]
    total_count: int
    page: int
    page_size: int


# --- Route handlers ---


@router.post(
    "",
    response_model={Resource}Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new {resource}",
)
async def create_{resource}(
    request_body: Create{Resource}Request,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> {Resource}Response:
    """Create a new {resource} owned by the authenticated user.

    Validates the input, persists the record, and returns the created {resource}
    with its server-assigned ID and timestamps.
    """
    logger.info(
        "{resource}_creation_started",
        user_id=current_user.id,
        {resource}_name=request_body.name,
    )

    new_{resource} = await {Resource}Service.create(
        db_session=db_session,
        owner_id=current_user.id,
        name=request_body.name,
        description=request_body.description,
    )

    logger.info(
        "{resource}_creation_completed",
        user_id=current_user.id,
        {resource}_id=new_{resource}.id,
    )

    return {Resource}Response.model_validate(new_{resource})


@router.get(
    "/{{{resource}_id}}",
    response_model={Resource}Response,
    summary="Retrieve a {resource} by ID",
)
async def get_{resource}(
    {resource}_id: str,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> {Resource}Response:
    """Retrieve a single {resource} by its unique identifier.

    Returns 404 if the {resource} does not exist or is not accessible
    to the authenticated user.
    """
    {resource}_record = await {Resource}Service.get_by_id(
        db_session=db_session,
        {resource}_id={resource}_id,
        owner_id=current_user.id,
    )

    if not {resource}_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "{RESOURCE}_NOT_FOUND",
                "message": f"{Resource} with ID '{{resource}_id}' was not found",
            },
        )

    return {Resource}Response.model_validate({resource}_record)


@router.get(
    "",
    response_model={Resource}ListResponse,
    summary="List {resources} with pagination",
)
async def list_{resources}(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> {Resource}ListResponse:
    """List all {resources} accessible to the authenticated user.

    Results are paginated with a default page size of 20. The response
    includes the total count for client-side pagination controls.
    """
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    {resource}_records, total_count = await {Resource}Service.list_for_owner(
        db_session=db_session,
        owner_id=current_user.id,
        page=page,
        page_size=page_size,
    )

    return {Resource}ListResponse(
        items=[{Resource}Response.model_validate(record) for record in {resource}_records],
        total_count=total_count,
        page=page,
        page_size=page_size,
    )
```

## Template notes

**Naming**: Replace `{resource}`, `{Resource}`, `{RESOURCE}`, and `{resources}` with domain-specific nouns. Examples: `agent`/`Agent`/`AGENT`/`agents`, `session`/`Session`/`SESSION`/`sessions`.

**Logging**: Uses `structlog` with structured context. Event names are `snake_case` and describe completed actions: `agent_creation_completed`, not `creating_agent`. Log messages never include sensitive data (passwords, tokens, PII).

**Error responses**: Structured JSON with a machine-readable `code` (SCREAMING_SNAKE_CASE) and a human-readable `message` (en-AU spelling). Never return bare string errors or expose stack traces.

**Type hints**: Every function parameter and return type is annotated. Pydantic models validate all external input. No `Any` types without justification.

**Pagination**: Clamped to sensible defaults. `page_size` cannot exceed 100 to prevent accidental full-table scans.
