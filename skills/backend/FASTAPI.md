---
name: fastapi
version: 1.0.0
description: FastAPI patterns and best practices
author: Your Team
priority: 3
triggers:
  - fastapi
  - api
  - endpoint
---

# FastAPI Patterns

## Application Structure

```python
# src/api/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    await init_database()
    yield
    # Shutdown
    await close_database()

app = FastAPI(
    title="API",
    version="0.1.0",
    lifespan=lifespan,
)
```

## Route Organization

```python
# src/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Database = Depends(get_db),
):
    return await db.get_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Database = Depends(get_db),
):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Request/Response Models

```python
from pydantic import BaseModel, EmailStr, Field

class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

## Dependency Injection

```python
from fastapi import Depends, Request

# Simple dependency
async def get_db() -> Database:
    db = Database()
    try:
        yield db
    finally:
        await db.close()

# Auth dependency
async def get_current_user(
    request: Request,
    db: Database = Depends(get_db),
) -> User:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = await verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user

# Using dependencies
@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user
```

## Middleware

```python
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        duration = time.time() - start_time
        logger.info(
            "Request completed",
            path=request.url.path,
            method=request.method,
            status=response.status_code,
            duration=duration,
        )

        return response

app.add_middleware(LoggingMiddleware)
```

## Error Handling

```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation failed", "details": exc.errors()},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error("Unhandled exception", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
```

## Background Tasks

```python
from fastapi import BackgroundTasks

@router.post("/notifications")
async def send_notification(
    notification: NotificationRequest,
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(
        send_email,
        notification.email,
        notification.message,
    )
    return {"status": "scheduled"}
```

## Testing

```python
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Sync testing
def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200

# Async testing
@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/users",
            json={"email": "test@example.com", "name": "Test", "password": "password123"},
        )
        assert response.status_code == 201
```

## Verification

- [ ] All routes have response models
- [ ] Input validation works
- [ ] Authentication enforced where needed
- [ ] Error responses are consistent
- [ ] OpenAPI docs are correct
