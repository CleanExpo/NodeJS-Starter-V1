# Structured Logging -- Before/After Examples

> Concrete transformations from anti-patterns to correct structured logging.

---

## Example 1: print() to structlog

### Before

```python
def create_document(title: str, user_id: str):
    print(f"Creating document: {title}")
    doc = Document(title=title, owner_id=user_id)
    db.add(doc)
    db.commit()
    print(f"Created doc {doc.id} for user {user_id}")
    return doc
```

**Problems**: No timestamps, no level filtering, invisible to log aggregation, unstructured text.

### After

```python
from src.utils import get_logger

logger = get_logger(__name__)


def create_document(title: str, user_id: str):
    logger.info("Creating document", title=title, user_id=user_id)
    doc = Document(title=title, owner_id=user_id)
    db.add(doc)
    db.commit()
    logger.info("Document created", document_id=doc.id, user_id=user_id)
    return doc
```

**Production JSON output**:

```json
{
  "timestamp": "2026-02-13T09:30:00.000Z",
  "level": "info",
  "event": "Document created",
  "logger": "src.services.documents",
  "correlation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "document_id": "doc_123",
  "user_id": "usr_456"
}
```

---

## Example 2: f-string to Structured Key-Value

### Before

```python
logger.info(f"User {user.email} logged in from {request.client.host} at {datetime.now()}")
logger.error(f"Agent {agent_name} failed after {duration}ms: {str(exc)}")
logger.warning(f"Rate limit: {current}/{limit} for {endpoint}")
```

**Problems**: Unique strings per call, impossible to aggregate, no filterable fields.

### After

```python
logger.info("User logged in", user_id=user.id, client_ip=request.client.host)
logger.error("Agent failed", agent=agent_name, duration_ms=duration, error_code="AGENT_RUNTIME_FAILED", error=str(exc))
logger.warning("Rate limit approaching", current=current, limit=limit, endpoint=endpoint)
```

**Query capability**: `SELECT COUNT(*) FROM logs WHERE event = 'User logged in' AND user_id = 'usr_456'`

---

## Example 3: console.log to Logger (Frontend)

### Before

```typescript
async function fetchDocuments(userId: string) {
  console.log('Fetching documents for user:', userId);
  try {
    const response = await fetch(`/api/documents?userId=${userId}`);
    const data = await response.json();
    console.log('Got documents:', data.length);
    return data;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
}
```

**Problems**: No level filtering, no timestamps, no structured context, leaks to browser console in production.

### After

```typescript
import { logger } from '@/lib/logger';

async function fetchDocuments(userId: string) {
  logger.debug('Fetching documents', { userId });
  try {
    const response = await fetch(`/api/documents?userId=${userId}`);
    const data = await response.json();
    logger.info('Documents fetched', { userId, count: data.length });
    return data;
  } catch (error) {
    logger.error('Failed to fetch documents', error, { userId });
    throw error;
  }
}
```

---

## Example 4: Secrets Redaction

### Before

```python
logger.info("OAuth callback", token=access_token, refresh=refresh_token)
logger.debug("API request", headers=dict(request.headers))  # leaks Authorization
```

### After

```python
logger.info("OAuth callback", provider="google", user_id=user.id, token_type="bearer")
logger.debug("API request", method=request.method, path=request.url.path)
```

---

## Example 5: Error with Taxonomy Code

### Before

```python
try:
    result = await agent.run(task)
except TimeoutError:
    logger.error(f"Agent timed out running task: {task}")
    raise
```

### After

```python
try:
    result = await agent.run(task)
except TimeoutError:
    logger.error(
        "Agent timed out",
        error_code="AGENT_RUNTIME_TIMEOUT",
        agent=agent_name,
        task=task[:100],
    )
    raise
```
