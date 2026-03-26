# Gate Configuration Template - Generic

Gate configuration template for any project. Adapt risk thresholds, confidence weights, and operation types to your stack.

---

## Project Gate Configuration

```yaml
# .guardian/gate-config.yml
project:
  name: "{project-name}"
  locale: "en-AU"
  date_format: "DD/MM/YYYY"

risk_thresholds:
  low: 1-3
  medium: 4-6
  high: 7-10

confidence_weights:
  familiarity: 0.25
  test_coverage: 0.25
  complexity: 0.25
  scope: 0.25

confidence_thresholds:
  high: 80
  moderate: 50
  low: 0
```

---

## Operation Type Gates

### Database Gates

```yaml
database_migration:
  default_risk: HIGH
  gates:
    - name: "Rollback function exists"
      check: "Verify migration has a reverse/downgrade step"
      blocking: true
    - name: "No data loss"
      check: "Scan for destructive DDL (DROP, TRUNCATE)"
      blocking: true
    - name: "Migration tested"
      check: "Run migration on local/staging database"
      blocking: true
```

### Auth Gates

```yaml
auth_change:
  default_risk: HIGH
  gates:
    - name: "No secret exposure"
      check: "Scan diff for hardcoded credentials"
      blocking: true
    - name: "Session continuity"
      check: "Verify existing sessions are handled gracefully"
      blocking: true
    - name: "Auth tests pass"
      check: "Run authentication test suite"
      blocking: true
```

### API Contract Gates

```yaml
api_contract_change:
  default_risk: MEDIUM
  gates:
    - name: "Breaking change documented"
      check: "Verify changelog or API version bump"
      blocking: false
    - name: "Consumer schemas updated"
      check: "All API consumers reflect new contract"
      blocking: true
    - name: "API tests pass"
      check: "Run API integration tests"
      blocking: true
```

### Deployment Gates

```yaml
deployment:
  default_risk: HIGH
  gates:
    - name: "All tests pass"
      check: "Run full test suite"
      blocking: true
    - name: "Type/lint checks pass"
      check: "Run static analysis"
      blocking: true
    - name: "No secrets in build"
      check: "Scan build output for credential patterns"
      blocking: true
```

### Destructive Operation Gates

```yaml
destructive_file_op:
  default_risk: HIGH
  gates:
    - name: "Work is committed"
      check: "Verify target files are committed or backed up"
      blocking: true
    - name: "No shared resource impact"
      check: "Verify files are not imported by other modules"
      blocking: true
```

### Dependency Gates

```yaml
dependency_change:
  default_risk: LOW
  gates:
    - name: "No known vulnerabilities"
      check: "Run dependency audit"
      blocking: false
    - name: "Compatibility check"
      check: "Dry-run install succeeds"
      blocking: true
```

### Configuration Gates

```yaml
config_change:
  default_risk: LOW
  gates:
    - name: "Syntax valid"
      check: "Validate configuration file syntax"
      blocking: true
    - name: "Variables documented"
      check: "New env vars added to documentation"
      blocking: false
```

---

## Risk Response Templates

### LOW Risk

```
[GUARDIAN: LOW RISK] Proceeding with {operation}.
Gates passed: {list}.
```

### MEDIUM Risk

```
[GUARDIAN: MEDIUM RISK] {operation} requires approval.
Blast radius: {assessment}
Reversibility: {assessment}
Confidence: {assessment}
Approval required before proceeding.
```

### HIGH Risk

```
[GUARDIAN: HIGH RISK] {operation} blocked pending review.
Blast radius: {assessment}
Reversibility: {assessment}
Confidence: {assessment}

Rollback Plan:
1. {step}
2. {step}
3. {step}

Respond with "proceed" to continue.
```
