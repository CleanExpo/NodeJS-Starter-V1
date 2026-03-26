# Structured Logging -- Anti-Patterns

> Banned patterns extracted from the structured-logging skill. Every violation breaks log aggregation, leaks sensitive data, or creates alert noise.

---

## AP-1: Unstructured f-string Interpolation

**Severity**: High -- breaks machine parsing and log aggregation pipelines.

```python
# BANNED
logger.info(f"Document {doc.id} created by user {user.id}")
logger.warning(f"Rate limit at {current}/{limit} for endpoint {path}")

# CORRECT
logger.info("Document created", document_id=doc.id, user_id=user.id)
logger.warning("Rate limit approaching", current=current, limit=limit, path=path)
```

**Why it fails**: f-strings produce unique strings per invocation. Log aggregation tools (Datadog, Loki, CloudWatch Insights) cannot group, filter, or alert on free-text strings. Structured key-value pairs enable `WHERE document_id = 'abc'` queries.

---

## AP-2: print() for Logging

**Severity**: High -- bypasses all logging infrastructure.

```python
# BANNED
print(f"Created doc: {doc.id}")
print("DEBUG: entering function")

# CORRECT
logger.info("Document created", document_id=doc.id)
logger.debug("Entering function", function="create_document")
```

```typescript
// BANNED
console.log('User logged in');
console.error('Failed to load', error);

// CORRECT
logger.info('User logged in', { userId: user.id });
logger.error('Failed to load', error, { component: 'Dashboard' });
```

**Why it fails**: `print()` and `console.log()` bypass level filtering, have no timestamps, no structured context, and no correlation IDs. Output is invisible to log aggregation systems.

---

## AP-3: Secrets in Log Output

**Severity**: Critical -- security breach via log exposure.

```python
# BANNED
logger.info("User authenticated", token=jwt_token, password=password)
logger.debug("API call", headers=dict(request.headers))  # leaks Authorization header
logger.info("OAuth callback", query_params=dict(request.query_params))  # leaks tokens

# CORRECT
logger.info("User authenticated", user_id=user.id, method="jwt")
logger.debug("API call", method=request.method, path=request.url.path)
logger.info("OAuth callback", provider="google", user_id=user.id)
```

**Why it fails**: Logs are stored in plain text, often retained for months, and accessible to operations staff. Credentials in logs enable account takeover, API key abuse, and session hijacking. Violates Privacy Act 1988 (Cth) for personal data.

---

## AP-4: Full Request/Response Bodies in Logs

**Severity**: Medium -- bloats storage, leaks data, degrades performance.

```python
# BANNED
logger.info("Request received", body=await request.json())
logger.debug("Response sent", response_body=response.body)

# CORRECT
logger.info("Request received", method=request.method, path=request.url.path, content_length=request.headers.get("content-length"))
logger.debug("Response sent", status=response.status_code, content_length=len(response.body))
```

**Why it fails**: Request/response bodies can contain PII, credentials, and large payloads. Logging them inflates storage costs, slows log ingestion, and creates compliance risk. Log summaries (method, path, status, content-length) provide equivalent debugging value.

---

## AP-5: Inconsistent Log Levels

**Severity**: Medium -- creates noisy alerts and missed critical errors.

```python
# BANNED: ERROR for recoverable issues
logger.error("Rate limit approaching", current=95, limit=100)  # This is a WARNING

# BANNED: INFO for debug-only data
logger.info("Query parameters", params=dict(request.query_params))  # This is DEBUG

# BANNED: DEBUG for significant business events
logger.debug("User logged in", user_id=user.id)  # This is INFO

# CORRECT
logger.warning("Rate limit approaching", current=95, limit=100)
logger.debug("Query parameters", params=dict(request.query_params))
logger.info("User logged in", user_id=user.id)
```

**Level guide**:

| Level | When to Use |
|-------|-------------|
| **ERROR** | Operation failed, needs attention (DB connection lost, agent failed) |
| **WARNING** | Recoverable issue, degraded behaviour (rate limit approaching, fallback used) |
| **INFO** | Significant business events (login, document created, agent completed) |
| **DEBUG** | Development-only detail (query params, intermediate results) |

**Why it fails**: ERROR-level for warnings triggers false alerts and causes on-call fatigue. INFO-level for debug data floods production logs. DEBUG-level for business events hides important audit trails when production runs at INFO level.
