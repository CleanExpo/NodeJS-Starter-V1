# Command: /swarm-audit

**Category:** System Intelligence
**Description:** Run automated audit of codebase architecture, patterns, and quality

## Usage

```
/swarm-audit
```

Or audit a specific area:

```
/swarm-audit routes
/swarm-audit middleware
/swarm-audit services
```

## What It Does

This command performs a multi-dimensional analysis:

1. **Architecture Audit**
   - Validates separation of concerns
   - Checks for architectural violations
   - Maps dependencies and layers

2. **Pattern Detection**
   - Identifies inconsistent patterns
   - Detects code duplication
   - Flags anti-patterns

3. **Quality Checks**
   - Tests for error handling completeness
   - Validates logging coverage
   - Checks middleware ordering

4. **Documentation Gaps**
   - Identifies undocumented routes
   - Finds functions without JSDoc
   - Flags configuration that's not explained

5. **Security Scan**
   - Checks for missing auth guards
   - Validates input sanitization
   - Scans for secrets in code

## Example Output

```
SWARM AUDIT REPORT
==================

Architecture: HEALTHY
- 12/12 routes follow pattern
- 8/8 services have proper separation
- 0 circular dependencies

Patterns: WARNINGS FOUND
- 3 routes missing error handling
- 2 middleware not chained correctly
- 1 service lacks input validation

Documentation: GAPS FOUND
- 5 routes not documented in ROUTE_REFERENCE.md
- 12 functions missing JSDoc
- 2 config vars undocumented

Security: PASSED
- All protected routes authenticated
- Input validation on all user inputs
- No secrets found in code

Recommendations:
1. Add error handling to routes/data/create.js
2. Document new /api/export endpoint
3. Add JSDoc to middleware/validation.js functions
```

## Output

Results are saved to:
```
.pi/ceo-agents/artifacts/swarm-audit-[DATE].json
```

And summarized in the console.

## Using Results

1. **Fix Issues** — Address high-priority recommendations
2. **Create Issues** — Log findings as GitHub issues
3. **Plan Refactoring** — Use architecture findings for sprints
4. **Update Docs** — Fill gaps found by the audit

## Related Commands

- **`/hey-claude`** — Ask Claude to explain audit findings
- **`/ceo-begin`** — Deliberate on architectural changes
- **`/generate-route-reference`** — Fix documentation gaps

## Tips

- Run before major refactoring
- Use before each release to catch issues
- Run quarterly to detect drift
- Export results for stakeholder reviews

---

**See Also:**
- [SYSTEM_DOCS.md](../../SYSTEM_DOCS.md) — Architecture documentation
- [CLAUDE.md](../../CLAUDE.md) — All commands
