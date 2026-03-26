# Execution Guardian - Generic Standards

Generic execution governance patterns applicable to any project, independent of the NodeJS-Starter-V1 stack.

---

## Universal Risk Categories

### Category 1: Data Destruction

Any operation that permanently removes or overwrites data without a recovery path.

**Signals**: DELETE, DROP, TRUNCATE, rm, reset --hard, force-push, overwrite
**Default Risk**: HIGH
**Required Gate**: Verify backup exists or operation is reversible

### Category 2: Access Control

Any operation that modifies who can access what, or how identity is verified.

**Signals**: Auth config, secret rotation, permission changes, RBAC, OAuth, session management
**Default Risk**: HIGH
**Required Gate**: Verify existing sessions handled; no secret exposure in code

### Category 3: Contract Changes

Any operation that modifies the interface between two systems.

**Signals**: API response shape, request parameters, database schema, message format
**Default Risk**: MEDIUM
**Required Gate**: Verify all consumers are updated; breaking changes documented

### Category 4: Environment Changes

Any operation that modifies the runtime environment.

**Signals**: Environment variables, infrastructure config, deployment, DNS
**Default Risk**: MEDIUM
**Required Gate**: Verify variables documented; rollback path exists

### Category 5: Dependency Changes

Any operation that modifies external dependencies.

**Signals**: Package install/remove, version bump, transitive dependency update
**Default Risk**: LOW
**Required Gate**: Vulnerability scan; compatibility check

---

## Generic Gate Templates

### Pre-Execution Gate

```
GATE: {gate_name}
  DESCRIPTION: {what this gate validates}
  CHECK: {command or verification step}
  BLOCKING: {YES | NO}
  APPLIES_TO: {operation types}
```

### Post-Execution Gate

```
GATE: {gate_name}
  DESCRIPTION: {what this gate validates after execution}
  CHECK: {command to verify success}
  ROLLBACK: {command to undo if check fails}
```

---

## Generic Confidence Model

For projects without specific confidence weights, use equal weighting:

```
confidence = (familiarity * 0.25)
           + (test_coverage * 0.25)
           + (complexity * 0.25)
           + (scope * 0.25)
```

### Familiarity Scale

| Score | Description |
|-------|------------|
| 100% | Team has done this exact operation before |
| 75% | Similar operation done in a different context |
| 50% | Understood in theory, not yet practised |
| 25% | Novel technology or pattern |
| 0% | Completely unknown domain |

---

## Generic Risk Matrix

| | Low Blast Radius | Medium Blast Radius | High Blast Radius |
|---|---|---|---|
| **Easily Reversible** | LOW | LOW | MEDIUM |
| **Requires Manual Rollback** | LOW | MEDIUM | HIGH |
| **Irreversible** | MEDIUM | HIGH | HIGH |

---

## Governance Intensity Levels

| Level | When | Gates | Approval |
|-------|------|-------|----------|
| **None** | Read-only, exploration, planning | No gates | No |
| **Light** | Low-risk writes, familiar patterns | Advisory gates only | No |
| **Standard** | Normal development, medium risk | All gates; blocking on failure | MEDIUM+ risk |
| **Full** | Deployments, migrations, security | All gates + rollback plan | All non-LOW risk |

---

## Error Reporting Standard

When a gate blocks execution:

```
ERROR: {what was blocked}
CAUSE: {why the gate failed}
RISK:  {LOW | MEDIUM | HIGH} - {summary}
FIX:   {specific remediation}
BLOCKING: {YES | NO}
```

- Report all errors in sequence when multiple gates fail
- Overall BLOCKING = YES if any individual error is BLOCKING: YES
- Overall RISK = highest individual risk level
- List fixes in priority order

---

## Rollback Plan Template

Required for all HIGH risk operations:

```
ROLLBACK PLAN
=============
Operation: {description}
Risk Level: HIGH

Steps:
1. {first rollback action}
2. {second rollback action}
3. {verification that rollback succeeded}

Estimated Time: {duration}
Data Loss Risk: {none | partial | complete}
```
