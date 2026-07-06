# Implementation Plan — Scan Findings Remediation

**Created**: 2025-07-17  
**Status**: Draft  
**Scope**: 5 findings → 5 work items  
**Principle**: Bounded, safe, each item independently revertible

---

## Finding 1: Beads Integration in CI/CD Pipeline

### Context
The repo already has `.beads/` initialised (`config.yaml`, `issues.jsonl`, `interactions.jsonl`, `metadata.json`). The `bd` CLI is documented in `.beads/README.md`. However, no CI/CD workflow currently invokes Beads for automated issue tracking (e.g., auto-creating issues when tests fail, linking issues to PRs, syncing on merge).

### Affected Files
| File | Action | Risk |
|------|--------|------|
| `.github/workflows/ci.yml` | **Edit** — Add `beads-auto-track` job after `build` | Low — additive |
| `.github/workflows/agent-pr-checks.yml` | **Edit** — Add `bd sync` step and issue-reference validation | Low — additive |
| `.github/scripts/beads-ci.sh` | **New** — Helper script: install `bd`, sync issues, auto-create | Low — new file |
| `.beads/config.yaml` | **Edit** — Set `sync-branch: "beads-sync"` for team consistency | Very Low |

### Sequencing (safe order)
1. **Phase 1a** — Create `beads-ci.sh` helper script (isolated, testable standalone)
2. **Phase 1b** — Update `.beads/config.yaml` to pin `sync-branch`
3. **Phase 1c** — Add a **non-blocking** `beads-sync` step to `ci.yml` that syncs the beads branch but only logs warnings (no failures)
4. **Phase 1d** — Add `bd create` auto-issue step in `agent-pr-checks.yml` for PRs that touch `apps/backend/src/agents/` (scoped to agent regressions)
5. **Phase 1e** — After 1 week of telemetry, make the Beads sync step blocking on `main` branch

### Rollback
- Delete `beads-ci.sh`, revert the two workflow YAML edits, revert `config.yaml`. No data loss — issues remain in `.beads/issues.jsonl`.

### Verification
- Push a branch that modifies `orchestrator.py` → confirm CI creates a Beads issue automatically
- Check the `beads-sync` branch exists and contains issue snapshots

---

## Finding 2: Comprehensive Inline Comments in Core AI Agent Logic

### Context
The core agent files have good module-level docstrings but inconsistent inline commentary on algorithmic decisions, edge cases, and design rationale. The most complex file (`orchestrator.py`, ~700 lines) has section headers but many methods lack per-step explanations.

### Affected Files (ranked by complexity × lack of comments)
| File | Lines | Current Quality | Action |
|------|-------|-----------------|--------|
| `apps/backend/src/agents/orchestrator.py` | ~700 | Good docstrings, sparse inline | Add per-method rationale + edge-case notes |
| `apps/backend/src/agents/base_agent.py` | ~560 | Moderate | Add comments on verification workflow, self-attestation guard rationale |
| `apps/backend/src/agents/registry.py` | ~100 | Sparse | Add agent lifecycle + registration pattern notes |
| `apps/backend/src/agents/subagent_manager.py` | TBD | Unknown | Audit + comment |
| `apps/backend/src/agents/intelligent_router.py` | TBD | Unknown | Audit + comment |
| `apps/backend/src/agents/context/context_manager.py` | TBD | Unknown | Audit + comment |

### Sequencing
1. **Phase 2a** — Audit remaining files (`subagent_manager.py`, `intelligent_router.py`, `context_manager.py`) to assess current state
2. **Phase 2b** — Comment `orchestrator.py` first (highest impact, most complex)
3. **Phase 2c** — Comment `base_agent.py` (foundational, affects all agents)
4. **Phase 2d** — Comment `registry.py` + remaining files

### Comment Standards (to enforce)
- **Why** comments on every non-trivial decision (not *what* — the code says what)
- Edge case notes on retry logic, timeout handling, error paths
- `# SAFETY:` prefix for anything that prevents data loss or security issues
- `# PERF:` prefix for performance-critical sections
- No comments on obvious lines (`x = x + 1`)

### Rollback
- Git revert per-file. Comments are additive, cannot break runtime behavior.

### Verification
- `pnpm type-check` passes (comments don't affect types)
- `pnpm lint` passes
- Backend test suite (`pytest`) unchanged

---

## Finding 3: Skills Documentation — Usage Examples & Edge Cases

### Context
Skills files under `skills/` are well-structured with YAML frontmatter and code examples, but coverage varies. Some skills lack edge case documentation, failure mode guidance, and integration gotchas.

### Affected Files (prioritised by usage frequency × documentation gaps)
| Skill | Current State | Enhancement |
|-------|---------------|-------------|
| `skills/database/supabase.skill.md` | Needs review | Add RLS edge cases, realtime subscription error handling, Australian data compliance gotchas |
| `skills/database/migrations.skill.md` | Needs review | Add rollback patterns, data migration edge cases, zero-downtime migration patterns |
| `skills/backend/langgraph.skill.md` | Needs review | Add state management edge cases, checkpoint recovery, multi-agent deadlock patterns |
| `skills/workflow/feature-development.skill.md` | Needs review | Add real-world workflow traces, common failure modes and recovery |
| `skills/workflow/bug-fixing.skill.md` | Needs review | Add reproduction case studies, root cause analysis patterns |
| `skills/frontend/components.skill.md` | Needs review | Add SSR/hydration edge cases, accessibility failure modes |
| `skills/verification/error-handling.skill.md` | Good | Add async error propagation edge cases, structured logging correlation IDs |

### Sequencing
1. **Phase 3a** — Audit all 7 files for gap analysis (30 min per file)
2. **Phase 3b** — Enhance `supabase.skill.md` + `migrations.skill.md` (database pair, tight coupling)
3. **Phase 3c** — Enhance `langgraph.skill.md` + `error-handling.skill.md` (backend pair)
4. **Phase 3d** — Enhance `feature-development.skill.md` + `bug-fixing.skill.md` (workflow pair)
5. **Phase 3e** — Enhance `components.skill.md`

### Enhancement Template per Skill
```markdown
## Edge Cases
- [Case 1]: Symptoms, root cause, resolution
- [Case 2]: ...

## Failure Modes
| Failure | Detection | Recovery |
|---------|-----------|----------|
| ... | ... | ... |

## Integration Gotchas
- When combining with [X skill], watch out for [Y]
```

### Rollback
- Git revert per-file. Skills are documentation-only.

### Verification
- Each enhanced skill's YAML frontmatter `version` is bumped
- `skills/INDEX.md` "Last Updated" refreshed

---

## Finding 4: Test Coverage for Critical AI Operation API Routes

### Context
Current test coverage is uneven:
- **Well-tested**: `test_prd_routes.py` (13 tests, good mocking patterns)
- **Sparse**: `tests/api/test_agent_dashboard.py`, `tests/api/test_task_queue.py`
- **Missing**: No dedicated test files for `agents.py`, `chat.py`, `workflows.py`, `workflow_builder.py` routes

### Affected Files
| File | Action | Target |
|------|--------|--------|
| `apps/backend/tests/api/test_agent_routes.py` | **New** | Tests for `POST /agents/run`, `GET /agents/run/{id}`, `GET /agents/active` |
| `apps/backend/tests/api/test_chat_routes.py` | **New** | Tests for `POST /chat`, `POST /chat/stream` |
| `apps/backend/tests/api/test_workflow_routes.py` | **New** | Tests for CRUD + execute endpoints |
| `apps/backend/tests/api/test_prd_routes.py` | **Edit** | Add edge cases: timeout handling, concurrent requests, invalid context shapes |

### Test Case Matrix (minimum per route)
| Route | Happy Path | Auth Error | Validation Error | Not Found | Timeout | Server Error |
|-------|-----------|------------|-----------------|-----------|---------|--------------|
| `POST /agents/run` | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| `GET /agents/run/{id}` | ✅ | N/A | ✅ | ✅ | N/A | ✅ |
| `GET /agents/active` | ✅ | N/A | ✅ | N/A | N/A | ✅ |
| `POST /chat` | ✅ | ✅ | ✅ | N/A | N/A | ✅ |
| `POST /chat/stream` | ✅ | ✅ | N/A | N/A | N/A | N/A |
| `POST /workflows/` | ✅ | ✅ | ✅ | N/A | N/A | ✅ |
| `GET /workflows/{id}` | ✅ | N/A | N/A | ✅ | N/A | ✅ |
| `POST /workflows/{id}/execute` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ |
| `POST /api/prd/generate` | ✅ (exists) | ✅ (exists) | ✅ (exists) | N/A | **NEW** | **NEW** |

### Sequencing
1. **Phase 4a** — Create `test_agent_routes.py` (highest-risk: long-running background tasks, timeout handling)
2. **Phase 4b** — Create `test_chat_routes.py` (streaming endpoint needs special test patterns)
3. **Phase 4c** — Create `test_workflow_routes.py` (CRUD + execution)
4. **Phase 4d** — Add timeout/concurrent tests to `test_prd_routes.py`
5. **Phase 4e** — Run full suite, check coverage delta (`pytest --cov=src/api/routes --cov-report=term-missing`)

### Testing Pattern (consistent with existing `test_prd_routes.py`)
```python
# Use TestClient + AsyncMock for supabase/agent dependencies
# Use @patch on state stores and agent publishers
# All async tests use @pytest.mark.asyncio
# Leverage the AUTH_HEADERS fixture pattern from test_prd_routes.py
```

### Rollback
- Delete new test files, revert `test_prd_routes.py`. Tests are additive.

### Verification
- `pytest apps/backend/tests/api/ -v` passes
- Coverage report shows >80% line coverage on `src/api/routes/agents.py`, `chat.py`, `workflows.py`

---

## Finding 5: Error Handling in Database Service Layer with Detailed Logging

### Context
The current database layer has:
- **Good**: Slow-query detection in `database.py` via SQLAlchemy events
- **Good**: Graceful degradation in `supabase.py` (falls back to `NullStateStore`)
- **Missing**: Structured error logging on individual DB operations
- **Missing**: Connection health checks / circuit breaker
- **Missing**: Retry logic for transient failures (connection drops, pool exhaustion)
- **Missing**: No repository/service layer between raw routes and `SupabaseStateStore` — routes call `.table().select()` patterns directly

### Affected Files
| File | Action | Risk |
|------|--------|------|
| `apps/backend/src/config/database.py` | **Edit** — Add `DatabaseError` hierarchy, connection health check, structured error logging | Medium — foundational |
| `apps/backend/src/state/supabase.py` | **Edit** — Add per-operation try/except with structured logging, retry decorator for transient errors | Medium — all routes depend on this |
| `apps/backend/src/db/errors.py` | **New** — `DatabaseError`, `ConnectionError`, `QueryTimeoutError`, `IntegrityError` | Low — new file |
| `apps/backend/src/db/health.py` | **New** — `check_db_health()`, circuit breaker state | Low — new file |
| `apps/backend/src/api/deps.py` | **Edit** — Wire health check into FastAPI lifespan | Low |

### Error Hierarchy
```python
class DatabaseError(Exception):
    """Base exception for all database errors."""
    def __init__(self, message: str, operation: str, details: dict | None = None):
        ...

class ConnectionError(DatabaseError):
    """Cannot connect to database."""

class QueryTimeoutError(DatabaseError):
    """Query exceeded timeout threshold."""

class IntegrityError(DatabaseError):
    """Unique constraint, FK violation etc."""

class MigrationError(DatabaseError):
    """Schema migration failure."""
```

### Sequencing
1. **Phase 5a** — Create `src/db/errors.py` (no dependencies, pure definitions)
2. **Phase 5b** — Create `src/db/health.py` with `check_db_health()` and circuit breaker
3. **Phase 5c** — Enhance `database.py`: wrap `get_async_db()` with error logging, add `before_execute` event listener for structured query logging in debug mode
4. **Phase 5d** — Enhance `supabase.py`: add `@retry_on_transient` decorator to `save_task`, `update_agent_run`, `create_memory` methods; add structured `logger.error()` calls with `operation`, `table`, `error_type` fields
5. **Phase 5e** — Wire `check_db_health()` into `apps/backend/src/api/deps.py` for FastAPI startup event
6. **Phase 5f** — Add `GET /health/db` endpoint for external monitoring (optional, Phase 5f can be deferred)

### Rollback
- Delete `errors.py` and `health.py`. Revert `database.py`, `supabase.py`, `deps.py` changes. All changes are additive wrappers around existing behavior.

### Verification
- Simulate DB connection failure → confirm `ConnectionError` is raised with structured log
- Simulate slow query (>500ms) → confirm slow-query log fires with enriched context
- Simulate transient failure → confirm retry fires and succeeds on 2nd attempt
- `pytest` unchanged (no behavioral changes to existing APIs)

---

## Overall Sequencing (Cross-Finding Dependencies)

```
Week 1:
  Day 1-2: Finding 5 (DB errors — foundational, other work depends on stable DB)
  Day 2-3: Finding 2 (Agent comments — pure documentation, no risk)
  Day 3-4: Finding 3 (Skills docs — pure documentation, no risk)

Week 2:
  Day 1-2: Finding 4 (API route tests — depends on Finding 5 for error patterns)
  Day 3-4: Finding 1 (Beads CI — last, as it validates everything else in CI)
  Day 5: Buffer / review
```

### Why This Order
- **Finding 5 first**: DB error handling improvements benefit all downstream work
- **Findings 2+3 in parallel**: Both are documentation-only, zero runtime risk, can be done concurrently
- **Finding 4 after 5**: Tests should exercise the improved error handling from Finding 5
- **Finding 1 last**: Beads CI integration should be the final gate — once everything else is stable, CI can reliably auto-track issues

## Risk Summary

| Finding | Runtime Risk | Data Risk | Rollback Complexity |
|---------|-------------|-----------|---------------------|
| 1. Beads CI | Low (additive workflow steps) | None | Trivial (revert YAML + delete script) |
| 2. Agent comments | **Zero** (comments only) | None | Trivial (git revert) |
| 3. Skills docs | **Zero** (docs only) | None | Trivial (git revert) |
| 4. API tests | **Zero** (tests only) | None | Trivial (delete new files) |
| 5. DB error handling | Medium (wraps existing code) | None (additive) | Easy (revert 3 files + delete 2 new files) |

**No finding touches production data paths in a destructive way. All changes are additive or documentation-only.**