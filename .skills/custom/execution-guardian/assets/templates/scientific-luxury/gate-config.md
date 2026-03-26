# Gate Configuration Template - Scientific Luxury

Gate configuration for projects using the Scientific Luxury design system (OLED Black `#050505`, spectral colours, `rounded-sm`, Framer Motion).

---

## Project Gate Configuration

```yaml
# .guardian/gate-config.yml
project:
  name: "{project-name}"
  design_system: "scientific-luxury"
  locale: "en-AU"
  date_format: "DD/MM/YYYY"

risk_thresholds:
  low: 1-3
  medium: 4-6
  high: 7-10

confidence_weights:
  pattern_novelty: 0.30
  test_coverage: 0.30
  domain_complexity: 0.20
  change_scope: 0.20

confidence_thresholds:
  high: 80
  moderate: 50
  low: 0
```

---

## Operation Type Gates

### Database Gates (Scientific Luxury)

```yaml
database_migration:
  default_risk: HIGH
  gates:
    - name: "Backup or reversible"
      check: "Verify downgrade() exists in Alembic revision"
      blocking: true
    - name: "No data loss"
      check: "Scan for DROP COLUMN, DROP TABLE, ALTER TYPE"
      blocking: true
    - name: "Migration tested locally"
      check: "uv run alembic upgrade head"
      blocking: true
    - name: "Design token table preserved"
      check: "Verify design_tokens table not modified without approval"
      blocking: true
      note: "SL-specific: design token data is critical to the rendering pipeline"
```

### Frontend Gates (Scientific Luxury)

```yaml
frontend_change:
  default_risk: MEDIUM
  gates:
    - name: "Design system compliance"
      check: "No colours outside spectral palette (#00F5FF, #00FF88, #FFB800, #FF4444, #FF00FF)"
      blocking: false
      note: "Advisory — flag non-spectral colours for review"
    - name: "Animation library"
      check: "Framer Motion only — no CSS transitions, no react-spring"
      blocking: true
      note: "SL mandate: all animations via Framer Motion"
    - name: "Border radius"
      check: "rounded-sm only — no rounded-md, rounded-lg, rounded-full"
      blocking: true
      note: "SL mandate: sharp corners with minimal rounding"
    - name: "Background colour"
      check: "Base background must be #050505 (OLED Black)"
      blocking: false
      note: "Advisory for non-overlay components"
    - name: "Type-check passes"
      check: "pnpm turbo run type-check --filter=web"
      blocking: true
    - name: "Frontend tests pass"
      check: "pnpm test --filter=web"
      blocking: true
```

### Auth Gates (Scientific Luxury)

```yaml
auth_change:
  default_risk: HIGH
  gates:
    - name: "No secret exposure"
      check: "Grep for hardcoded secrets in diff"
      blocking: true
    - name: "Session handling"
      check: "Verify session invalidation strategy"
      blocking: true
    - name: "Auth tests pass"
      check: "cd apps/backend && uv run pytest tests/ -k 'auth'"
      blocking: true
    - name: "JWT middleware intact"
      check: "Verify apps/web/middleware.ts still validates tokens"
      blocking: true
```

### Deployment Gates (Scientific Luxury)

```yaml
deployment:
  default_risk: HIGH
  gates:
    - name: "Full test suite"
      check: "pnpm turbo run test"
      blocking: true
    - name: "Type-check clean"
      check: "pnpm turbo run type-check"
      blocking: true
    - name: "Lint clean"
      check: "pnpm turbo run lint"
      blocking: true
    - name: "No secrets in build"
      check: "Scan build artifacts for .env patterns"
      blocking: true
    - name: "Design system audit"
      check: "Verify no SL violations in changed components"
      blocking: false
      note: "Advisory — SL compliance check"
```

---

## Risk Response Templates

### LOW Risk Output

```
[GUARDIAN: LOW RISK] Proceeding with {operation}.
Gates passed: {list}. No rollback plan required.
Locale: en-AU | Timestamp: {DD/MM/YYYY HH:mm AEST}
```

### MEDIUM Risk Output

```
[GUARDIAN: MEDIUM RISK] {operation} requires approval.

Blast radius: {score}/10 — {assessment}
Reversibility: {score}/10 — {assessment}
Confidence: {pct}% — {assessment}

Design system impact: {none | advisory | blocking}

Approval required before proceeding.
```

### HIGH Risk Output

```
[GUARDIAN: HIGH RISK] {operation} blocked pending review.

Blast radius: {score}/10 — {assessment}
Reversibility: {score}/10 — {assessment}
Confidence: {pct}% — {assessment}

Rollback Plan:
1. {step 1}
2. {step 2}
3. {step 3}

Approval required. Respond with "proceed" to continue.
```
