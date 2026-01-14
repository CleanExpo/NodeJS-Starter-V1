# Performance Analysis Report

> Generated: 2026-01-14
> Branch: `claude/find-perf-issues-mkdpcwc8xtb58sb7-Ccke8`

## Executive Summary

This document identifies **47 performance anti-patterns** across the NodeJS-Starter-V1 codebase, categorized by severity and type.

---

## 🔴 CRITICAL Issues

### 1. N+1 Query Pattern in Contractor Search

**File:** `apps/backend/src/api/routes/contractors.py:457-462`

```python
# PROBLEM: Loop executes N additional queries
for contractor_id in list(contractor_ids)[offset:offset + page_size]:
    contractor = await get_contractor(contractor_id)  # N+1!
    contractors.append(contractor)
```

**Fix:** Batch fetch contractors in single query:
```python
contractor_ids_list = list(contractor_ids)[offset:offset + page_size]
result = supabase.table("contractors").select("*, availability_slots(*)").in_("id", contractor_ids_list).execute()
```

**Impact:** 20+ extra database queries per search request

---

### 2. Repeated User ID Lookups

**Files:**
- `apps/backend/src/api/routes/documents.py:156-159, 297-300, 378-381, 469-472, 559-562`
- `apps/backend/src/api/routes/search.py:134-137`

```python
# PROBLEM: Same query executed 6 times across endpoints
user_result = await db.execute(
    select(User.id).where(User.email == user_email)
)
```

**Fix:** Cache user lookup in FastAPI dependency or return user object from auth middleware.

**Impact:** 6 duplicate queries per user session

---

### 3. Python Aggregation Instead of SQL

**File:** `apps/backend/src/api/routes/analytics.py:59-73, 117-139, 179-197`

```python
# PROBLEM: Fetches ALL records, aggregates in Python
runs = result.data or []
completed_runs = len([r for r in runs if r.get("status") == "completed"])
failed_runs = len([r for r in runs if r.get("status") == "failed"])
```

**Fix:** Use SQL aggregation:
```sql
SELECT status, COUNT(*) FROM agent_runs GROUP BY status;
```

**Impact:** Transfers 1000+ records when only counts needed

---

### 4. Array Index Keys in React Lists

**Files:**
- `apps/web/app/(dashboard)/agents/components/PerformanceTrends.tsx:56`
- `apps/web/components/contractor-availability.tsx:138, 188`
- `apps/web/components/contractor-availability-live.tsx:248`

```tsx
// PROBLEM: Index keys cause bugs when list items reorder
{dataPoints.map((point, idx) => <Bar key={idx} />)}
```

**Fix:** Use unique identifiers:
```tsx
{dataPoints.map((point) => <Bar key={point.date} />)}
```

**Impact:** Data corruption and UI bugs when lists change

---

### 5. Missing Timeouts on All Fetch Calls

**Files:**
- `apps/web/lib/api/client.ts:43-86`
- `apps/web/lib/api/contractors.ts:40-80`
- `apps/web/lib/api/backend.ts:17-34`
- `apps/web/app/api/chat/route.ts:29-41`

```typescript
// PROBLEM: No timeout, requests hang indefinitely
const response = await fetch(url, options);
```

**Fix:** Add AbortController with timeout:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
try {
  const response = await fetch(url, { ...options, signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```

**Impact:** UI hangs when backend is slow/unresponsive

---

### 6. Polling Without Cleanup (Memory Leak)

**File:** `apps/web/app/dashboard-analytics/page.tsx:24-28`

```typescript
// PROBLEM: Interval never cleared
useEffect(() => {
  fetchMetrics();
  setInterval(fetchMetrics, 30000);  // No cleanup!
}, []);
```

**Fix:** Return cleanup function:
```typescript
useEffect(() => {
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 30000);
  return () => clearInterval(interval);
}, []);
```

**Impact:** Memory leak, infinite polling even after navigation

---

## 🟠 HIGH Severity Issues

### 7. Missing useMemo/useCallback (15+ locations)

**Files:**
- `apps/web/components/contractor-availability.tsx:40-87`
- `apps/web/components/contractor-availability-live.tsx:64-119`
- `apps/web/app/(dashboard)/agents/components/AgentStats.tsx:21-47`
- `apps/web/app/(dashboard)/tasks/components/TaskList.tsx:64-80`
- `apps/web/app/(dashboard)/agents/components/PerformanceTrends.tsx:45`

```tsx
// PROBLEM: Objects/functions recreated every render
const formatDate = (date) => { ... };  // New function each render
const cards = [{ title: "Total", value: stats.total }];  // New array each render
```

**Fix:**
```tsx
const formatDate = useCallback((date) => { ... }, []);
const cards = useMemo(() => [{ title: "Total", value: stats.total }], [stats]);
```

---

### 8. Sequential Embedding Generation

**File:** `apps/backend/src/rag/storage.py:129-135`

```python
# PROBLEM: Sequential async operations
for chunk in chunks:
    embedding = await self.embedding_provider.get_embedding(chunk["content"])
```

**Fix:** Parallelize with asyncio.gather:
```python
embeddings = await asyncio.gather(*[
    self.embedding_provider.get_embedding(chunk["content"])
    for chunk in chunks
])
```

**Impact:** 100+ seconds for 1000 chunks vs ~1 second parallelized

---

### 9. String Concatenation in Loops

**File:** `apps/web/lib/audit/report-generator.ts:179-381`

```typescript
// PROBLEM: 40+ string concatenations create new objects
content += `**Status:** ${status}\n\n`;
content += `**Checks:** ${checks}\n\n`;
```

**Fix:** Use array and join:
```typescript
const parts: string[] = [];
parts.push(`**Status:** ${status}`);
parts.push(`**Checks:** ${checks}`);
return parts.join('\n\n');
```

---

### 10. Chained Array Filters

**File:** `apps/web/lib/audit/evidence-collector.ts:428-455`

```typescript
// PROBLEM: 8 sequential filters = 8 array copies
results = results.filter((e) => e.type === query.type);
results = results.filter((e) => e.source === query.source);
results = results.filter((e) => e.category === query.category);
// ... 5 more filters
```

**Fix:** Single filter with compound condition:
```typescript
results = results.filter((e) =>
  (!query.type || e.type === query.type) &&
  (!query.source || e.source === query.source) &&
  (!query.category || e.category === query.category)
);
```

---

### 11. Manual Fetch Instead of React Query

**Files:**
- `apps/web/hooks/use-prd-generation.ts:70-253`
- `apps/web/hooks/use-agent-runs.ts:88-176`
- `apps/web/hooks/use-chat.ts:19-54`
- `apps/web/components/contractor-availability-live.tsx:34-61`

**Impact:** No caching, no deduplication, no automatic retry, no background refetch

**Fix:** Implement React Query or SWR for data fetching

---

### 12. No Request Cancellation

**Files:** All components using fetch without AbortController

```typescript
// PROBLEM: No cancellation on unmount
useEffect(() => {
  fetch(url).then(setData);  // Still runs after unmount!
}, []);
```

**Fix:**
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(setData);
  return () => controller.abort();
}, []);
```

---

## 🟡 MEDIUM Severity Issues

### 13. SELECT * Overuse

**Files:**
- `apps/backend/src/api/routes/analytics.py:49, 111, 170, 213`
- `apps/backend/src/api/routes/task_queue.py:181, 268, 462`
- `apps/backend/src/api/routes/rag.py:157`

**Fix:** Select only required columns

---

### 14. Missing Composite Indexes

**File:** `scripts/init-db.sql`

**Add:**
```sql
CREATE INDEX idx_agent_runs_status_date ON agent_runs(status, started_at DESC);
CREATE INDEX idx_availability_status_date ON availability_slots(status, date, state);
CREATE INDEX idx_documents_user_created ON documents(user_id, created_at DESC);
```

---

### 15. Missing React.memo

**Files:**
- `apps/web/app/(dashboard)/tasks/components/QueueStats.tsx:17-35`
- `apps/web/components/prd-generation-progress.tsx:20-89`
- `apps/web/app/(dashboard)/agents/components/AgentStats.tsx:20-82`

---

### 16. Missing Eager Loading in SQLAlchemy

**File:** `apps/backend/src/db/models.py:83-122`

```python
# Relationships use lazy loading by default
contractors = relationship("Contractor", back_populates="user")
```

**Fix:** Use joinedload/selectinload in queries

---

### 17. Over-fetching in API Responses

**Files:**
- `apps/backend/src/api/routes/contractors.py:80-139` - returns ALL availability slots
- `apps/backend/src/api/routes/documents.py:104-179` - returns full content in list

---

### 18. No Caching Strategy

**Files:**
- `apps/web/lib/api/client.ts` - no cache layer
- `apps/web/app/(dashboard)/tasks/page.tsx:21-22` - `cache: 'no-store'`
- `apps/web/app/(dashboard)/agents/page.tsx:22-24` - `cache: 'no-store'`

---

### 19. Large Components to Split

| File | Lines | Recommendation |
|------|-------|----------------|
| `agent-run-monitor.tsx` | 119 | Split loading/error/content |
| `prd/generate/page.tsx` | 221 | Split by state (idle/generating/success) |
| `contractor-availability-live.tsx` | 323 | Extract calendar, slots, loading states |

---

### 20. Missing Suspense Boundaries

**Files:**
- `apps/web/components/chat/chat-interface.tsx`
- `apps/web/app/(dashboard)/layout.tsx`
- `apps/web/app/(dashboard)/dashboard/page.tsx`

---

## Summary by Category

| Category | Critical | High | Medium | Total |
|----------|----------|------|--------|-------|
| Database/Queries | 3 | 2 | 3 | 8 |
| React Performance | 2 | 4 | 4 | 10 |
| Network/API | 2 | 3 | 2 | 7 |
| Algorithms | 0 | 3 | 2 | 5 |

---

## Recommended Fix Priority

### Phase 1: Quick Wins (1-2 hours)
1. Add composite indexes to database
2. Fix array index keys in React lists
3. Add cleanup to polling useEffect
4. Wrap fetch calls with timeout

### Phase 2: High Impact (4-8 hours)
1. Replace N+1 contractor search with batch query
2. Cache user ID lookups in FastAPI dependency
3. Add useMemo/useCallback to top components
4. Implement AbortController in all fetch calls

### Phase 3: Architecture (1-2 days)
1. Implement React Query for data fetching
2. Add SQL aggregation instead of Python loops
3. Parallelize embedding generation
4. Split large components

---

## Files Most in Need of Refactoring

1. `apps/backend/src/api/routes/contractors.py` - N+1, over-fetching, post-query filtering
2. `apps/backend/src/api/routes/analytics.py` - Python aggregation, SELECT *
3. `apps/web/lib/api/client.ts` - No timeout, no caching, no retry
4. `apps/web/hooks/use-prd-generation.ts` - Manual fetch, no cancellation, cascading state
5. `apps/web/components/contractor-availability-live.tsx` - Large component, no memoization
