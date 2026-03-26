---
id: audit
type: command
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Audit Command

Perform a full architecture audit of the codebase.

## Phase 0 — Repository Classification (MANDATORY FIRST STEP)

**HARD RULE**: Classification MUST run before any scoring. See `.claude/rules/audit-mode-classifier.md`.

Run the `audit-mode-classifier` skill to detect repository type:

```
CLASSIFICATION → MODE SELECTION → SCORING → REPORT
```

Signal detection:

- Framework signals (max 14 pts): CLAUDE.md with agents, .skills/ custom skills, .claude/agents/, adopt-project.\* script, "starter"/"template" in README, CONSTITUTION.md/memory.md, hooks system, no production URL
- Application signals (max 9 pts): live production URL, business-specific models, customer-facing docs, production deployment guide, apps/web + apps/backend as primary output

Scoring:

- Framework ≥ 8 AND Application ≤ 3 → FRAMEWORK MODE
- Application ≥ 8 AND Framework ≤ 3 → APPLICATION MODE
- Both ≥ 4 → HYBRID MODE

Output classification block before proceeding to Phase 1.

---

## Phase 1–8 — Audit (Mode-Aware)

After classification, apply mode-appropriate criteria. See `docs/AUDIT_MODES.md`.

## Architecture Audit Categories

### 1. LAYER VIOLATIONS (Critical)

Check for improper imports between layers:

- **Components importing from server/**: Components should NEVER import from `src/server/`
- **API routes importing from repositories/**: API routes must use services, not repositories directly
- **Repositories importing from services/**: Repositories should be independent of services

Search patterns:

```
src/components/**/*.{ts,tsx} -> import from '@/server/'
src/app/api/**/*.ts -> import from '@/server/repositories'
src/server/repositories/**/*.ts -> import from '@/server/services'
```

### 2. TYPE ISSUES (High)

- **Any type usage**: Search for `: any` or `as any`
- **Type assertions without validation**: Search for `as SomeType` without preceding validation
- **Missing return types**: Functions without explicit return types
- **Manual database types**: Types in `src/types/` that should be generated from Supabase

### 3. ASYNC ISSUES (High)

- **Unhandled promises**: Promises without `await` or `.catch()`
- **Async without await**: `async` functions that never use `await`

### 4. ERROR HANDLING (High)

- **Empty catch blocks**: `catch (e) {}` or `catch { }`
- **API routes without try/catch**: Route handlers missing error boundaries
- **Missing handleApiError**: API routes not using the standardized error handler

### 5. COMPONENT ISSUES (Medium)

For each component in `src/components/features/`:

- **Missing loading state**: No skeleton or loading indicator
- **Missing error state**: No error boundary or error display
- **Missing empty state**: No empty state handling

### 6. VALIDATION ISSUES (Medium)

- **API routes not validating input**: POST/PUT/PATCH handlers not using Zod
- **Missing validator files**: Features without corresponding validators

## Report Format

```
Architecture Audit Report
=========================

CRITICAL ISSUES:
- [Layer violations with file locations]

HIGH PRIORITY:
- [Type issues with file locations]
- [Async issues with file locations]
- [Error handling issues with file locations]

MEDIUM PRIORITY:
- [Component state issues]
- [Validation issues]

Summary:
- Critical: X issues
- High: X issues
- Medium: X issues
- Total: X issues
```

## Remediation

For each issue found, provide:

1. File path and line number
2. Description of the problem
3. Suggested fix
