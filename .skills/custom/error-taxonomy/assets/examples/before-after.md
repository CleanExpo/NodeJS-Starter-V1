# Error Taxonomy -- Before/After Examples

> Concrete transformations from anti-patterns to structured error handling.

---

## Example 1: Generic String to ErrorResponse

### Before

```python
@router.post("/api/documents")
async def create_document(doc: DocumentCreate, user: User = Depends(get_current_user)):
    if not doc.title:
        raise HTTPException(status_code=422, detail="Title is required")

    existing = await get_document_by_title(doc.title)
    if existing:
        raise HTTPException(status_code=409, detail="Document already exists")

    return await create(doc, user)
```

**Problems**: No error codes, no severity, frontend cannot programmatically handle these errors, inconsistent format.

### After

```python
@router.post("/api/documents")
async def create_document(doc: DocumentCreate, user: User = Depends(get_current_user)):
    if not doc.title:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ErrorResponse(
                detail="Please provide a document title.",
                error_code="DATA_VALIDATION_MISSING_FIELD",
                field="title",
            ).model_dump(),
        )

    existing = await get_document_by_title(doc.title)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorResponse(
                detail="A document with this title already exists.",
                error_code="DATA_CONFLICT_DUPLICATE",
            ).model_dump(),
        )

    return await create(doc, user)
```

**Frontend can now**: Check `error.isValidation` to highlight the title field. Check `error.errorCode === 'DATA_CONFLICT_DUPLICATE'` to suggest renaming.

---

## Example 2: Raw Exception to Structured Agent Error

### Before

```python
async def run_agent(agent_name: str, task: str):
    try:
        return await agent.execute(task)
    except TimeoutError:
        raise HTTPException(status_code=500, detail="Agent timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # Leaks internal error
```

**Problems**: HTTP 500 for a timeout (should be 504), leaks raw exception message, no error code.

### After

```python
async def run_agent(agent_name: str, task: str):
    try:
        return await agent.execute(task)
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

---

## Example 3: Frontend String Matching to Typed Error Handling

### Before

```typescript
try {
  await createDocument(data);
} catch (error: any) {
  if (error.message.includes('token')) {
    router.push('/login');
  } else if (error.message.includes('exists')) {
    setError('A document with this name exists');
  } else {
    setError(error.message);  // Shows raw server error to user
  }
}
```

**Problems**: Brittle string matching, breaks if server changes wording, may display internal errors.

### After

```typescript
import { ApiClientError } from '@/lib/api/errors';
import { getUserMessage } from '@/lib/api/error-messages';

try {
  await createDocument(data);
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isAuth) {
      router.push('/login');
    } else if (error.errorCode === 'DATA_CONFLICT_DUPLICATE') {
      setError('A document with this title already exists. Please choose a different title.');
    } else if (error.isValidation && error.field) {
      setFieldError(error.field, getUserMessage(error));
    } else {
      setError(getUserMessage(error));
    }
  }
}
```

---

## Example 4: Missing User Message to Mapped Message

### Before

```typescript
// Toast shows: "AUTH_VALIDATION_EXPIRED_TOKEN"
toast.error(error.errorCode);
```

### After

```typescript
// Toast shows: "Your session has expired. Please sign in again."
toast.error(getUserMessage(error));
```
