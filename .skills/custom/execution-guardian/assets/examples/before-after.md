# Execution Guardian - Before/After Examples

Demonstrates the difference between ungoverned execution and risk-scored execution with the Execution Guardian.

---

## Example 1: Database Migration

### BEFORE (Ungoverned)

```
User: "Drop the contractor_notes column, we don't use it anymore."

Agent: Sure, I'll create the migration.

> alembic revision --autogenerate -m "drop contractor_notes"
> alembic upgrade head

Done! The column has been dropped.
```

**Problems**:
- No check if column contains data (2,847 rows had values)
- No downgrade function in the migration
- No backup taken
- No approval requested for a HIGH risk operation
- Data permanently lost

### AFTER (Risk-Scored)

```
User: "Drop the contractor_notes column, we don't use it anymore."

[AGENT_ACTIVATED]: Execution Guardian
[MODE]: BUILD
[OPERATION]: DATABASE_MIGRATION
[RISK]: HIGH

GATE: No data loss in migration
  CHECK: SELECT COUNT(*) FROM contractors WHERE contractor_notes IS NOT NULL
  RESULT: 2,847 rows contain data
  STATUS: FAILED
  BLOCKING: YES

GATE: Backup or reversible
  CHECK: Verify downgrade() function exists
  RESULT: No downgrade function generated
  STATUS: FAILED
  BLOCKING: YES

ERROR: Migration drops column 'contractor_notes' with existing data
CAUSE: DROP COLUMN on non-empty column causes permanent data loss
RISK:  HIGH — 2,847 rows affected; data is not recoverable
FIX:   1. Create data backup: SELECT id, contractor_notes INTO contractor_notes_backup FROM contractors
       2. Add downgrade() function to migration revision
       3. Re-run migration after backup confirmed
BLOCKING: YES

[NEXT_ACTION]: await approval — provide rollback plan before proceeding
```

---

## Example 2: Auth Secret Rotation

### BEFORE (Ungoverned)

```
User: "Rotate the JWT secret."

Agent: Updated JWT_SECRET_KEY in .env.

Done! Secret rotated.
```

**Problems**:
- All existing user sessions immediately invalidated
- No dual-key validation period
- Users force-logged-out without warning
- No verification that auth tests still pass

### AFTER (Risk-Scored)

```
User: "Rotate the JWT secret."

[AGENT_ACTIVATED]: Execution Guardian
[MODE]: BUILD
[OPERATION]: AUTH_CHANGE
[RISK]: HIGH

Risk Assessment:
  Blast radius: 9/10 — All authenticated users affected
  Reversibility: 3/10 — Can revert to old secret, but sessions already invalidated
  Confidence: 45% — No dual-key implementation exists in codebase

GATE: Existing sessions handled
  CHECK: Verify session invalidation strategy for JWT secret rotation
  RESULT: No dual-key validation found in apps/backend/src/auth/jwt.py
  STATUS: FAILED
  BLOCKING: YES

GATE: Auth tests pass
  CHECK: cd apps/backend && uv run pytest tests/ -k "auth"
  RESULT: Pending — blocked by previous gate
  STATUS: SKIPPED

ERROR: Session invalidation strategy missing for secret rotation
CAUSE: JWT_SECRET_KEY change will invalidate all existing tokens with no graceful handling
RISK:  HIGH — All users will be force-logged-out simultaneously
FIX:   Implement dual-key validation period:
       1. Add JWT_SECRET_KEY_PREVIOUS env var
       2. Validate tokens against both keys during transition
       3. Set transition period (e.g., 24 hours)
       4. Remove old key after transition
BLOCKING: YES

Rollback Plan:
1. Revert JWT_SECRET_KEY to previous value
2. Restart backend service
3. Verify existing sessions resume working

[NEXT_ACTION]: await approval — implement dual-key validation before rotating
```

---

## Example 3: Multi-Layer API Change

### BEFORE (Ungoverned)

```
User: "Rename the 'availability' field to 'schedule' in the contractor API."

Agent: Updated the backend model and response.

Done!
```

**Problems**:
- Frontend Zod schema still references 'availability'
- Frontend renders `undefined` for contractor schedule
- No tests caught the mismatch
- Breaking change not documented

### AFTER (Risk-Scored)

```
User: "Rename the 'availability' field to 'schedule' in the contractor API."

[AGENT_ACTIVATED]: Execution Guardian
[MODE]: BUILD
[OPERATION]: API_CONTRACT_CHANGE, MULTI_LAYER_CHANGE
[RISK]: MEDIUM

Risk Assessment:
  Blast radius: 7/10 — Backend + Frontend affected
  Reversibility: 2/10 — Git revert possible
  Confidence: 60% — Pattern is known but cross-layer coordination required

GATE: Frontend contract updated
  CHECK: Verify Zod schema in apps/web/ matches new field name
  RESULT: apps/web/lib/api/schemas.ts still references 'availability'
  STATUS: FAILED
  BLOCKING: YES

GATE: API tests pass
  CHECK: cd apps/backend && uv run pytest tests/ -k "api"
  RESULT: Pending — will run after frontend schema updated
  STATUS: PENDING

ERROR: Breaking change to /api/contractors response shape
CAUSE: Field 'availability' renamed to 'schedule' without frontend update
RISK:  MEDIUM — Frontend will render undefined for contractor schedule
FIX:   Update Zod schema in apps/web/lib/api/schemas.ts:
       - Change field name from 'availability' to 'schedule'
       - Update any component references to the field
BLOCKING: YES

[NEXT_ACTION]: apply fix — update frontend schema, then re-run gates
```

---

## Example 4: LOW Risk (No Governance Overhead)

### BEFORE and AFTER (Same — Correct Behaviour)

```
User: "Add a comment explaining the retry logic in the agent handler."

[GUARDIAN: LOW RISK] Proceeding with CONFIG_CHANGE.
Gates passed: file exists, import paths valid. No rollback plan required.
```

The Guardian correctly does not add governance overhead to low-risk, non-destructive operations. Momentum is preserved.
