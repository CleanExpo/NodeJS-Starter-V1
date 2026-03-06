# Outcome Language and Done Gates

> **Purpose**: This document defines how human end-goal language maps to engineering completion criteria.
> It is the source of truth for what "done" means in this project — across every layer.

---

## The Problem

Non-technical founders and stakeholders describe goals in outcome language:

- "Make it work"
- "It's ready"
- "We're done"
- "Launch it"
- "Production ready"

These phrases feel complete but contain no measurable criteria. Without a translation layer,
they create misalignment between what a founder believes is finished and what an engineer
knows is verified.

This document defines the translation — and the proof required to claim each state.

---

## Language → Engineering Translation

| Outcome Phrase      | Engineering Meaning                                                    | Source Rule                  |
| ------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| "Finished"          | All production readiness gates passed, with proof                      | human-outcome-translation.md |
| "Done"              | All acceptance criteria met with verified artifacts                    | human-outcome-translation.md |
| "Ready"             | All gates passed; monitoring active; rollback path exists              | human-outcome-translation.md |
| "Production ready"  | All layers verified; CI green; no dev defaults in production           | human-outcome-translation.md |
| "Launch it"         | Production deployed; DNS confirmed; post-deploy health check passed    | human-outcome-translation.md |
| "Make it work"      | Root cause identified; fix applied; regression check passed            | human-outcome-translation.md |
| "Ready for clients" | End-to-end user journey verified; legal pages live; support reachable  | human-outcome-translation.md |
| "Ship it"           | Deployed to production with documented rollback path                   | human-outcome-translation.md |
| "Go live"           | Domain live; SSL valid; monitoring active; first user journey verified | human-outcome-translation.md |

---

## Production Readiness — Layer Definitions

Each layer has its own Done gate. ALL layers must pass before the system is production ready.

### 1. Frontend

| Criterion                           | How to Verify                                      | Proof Artifact                       |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------ |
| Production URL responds HTTP 200    | `curl -I https://your-url.com`                     | Terminal output                      |
| No console errors on critical paths | Browser DevTools → Console                         | Screenshot                           |
| Auth flows working                  | Manual test: register → login → dashboard → logout | Screen recording                     |
| No critical 404 errors              | Browser DevTools → Network tab                     | Screenshot                           |
| Responsive layout verified          | Chrome DevTools device emulation                   | Screenshot (mobile + desktop)        |
| All copy finalised                  | Content review                                     | Signed-off content doc               |
| Page load time acceptable           | Lighthouse audit                                   | Lighthouse report (Performance ≥ 75) |

### 2. Backend

| Criterion                                | How to Verify                         | Proof Artifact           |
| ---------------------------------------- | ------------------------------------- | ------------------------ |
| Health check endpoint returns 200        | `curl https://your-url.com/health`    | Terminal output          |
| All API endpoints respond correctly      | Postman or curl tests                 | Test results             |
| Auth middleware rejecting invalid tokens | Send request with bad JWT             | 401 response confirmed   |
| No unhandled exceptions in logs          | Check production logs for ERROR level | Log screenshot           |
| Database migrations applied              | `alembic history` or equivalent       | Migration history output |
| Response times within SLA                | Load test or Lighthouse               | Test results             |

### 3. Data

| Criterion                      | How to Verify          | Proof Artifact       |
| ------------------------------ | ---------------------- | -------------------- |
| Required reference data seeded | Query production DB    | Query output         |
| No dev/test data in production | Audit records table    | Query output         |
| Backup schedule configured     | Check hosting platform | Dashboard screenshot |
| Data retention policy applied  | Review DB config       | Config screenshot    |

### 4. Security

| Criterion                                | How to Verify                         | Proof Artifact             |
| ---------------------------------------- | ------------------------------------- | -------------------------- |
| JWT_SECRET_KEY rotated from default      | `grep JWT_SECRET_KEY .env.production` | Confirms non-default value |
| `.env` not in git                        | `git log --all -- .env`               | Confirms no commits        |
| CORS restricted to production domain     | Review CORS config                    | Config screenshot          |
| Rate limiting active on auth endpoints   | Check middleware config               | Config screenshot          |
| HTTPS enforced (HTTP redirects to HTTPS) | `curl -I http://your-url.com`         | 301 redirect confirmed     |
| Dependency vulnerabilities scanned       | `npm audit` or `pip audit`            | Clean audit output         |

### 5. Payments (if applicable)

| Criterion                        | How to Verify             | Proof Artifact                    |
| -------------------------------- | ------------------------- | --------------------------------- |
| Payment provider in live mode    | Check provider dashboard  | Dashboard screenshot              |
| Webhook endpoint configured      | Provider webhook settings | Config screenshot                 |
| Webhook deliveries confirmed     | Provider delivery log     | Delivery log screenshot           |
| Test transaction successful      | Run test payment          | Transaction in provider dashboard |
| Refund flow tested               | Process test refund       | Refund confirmation               |
| Failed payment handling verified | Simulate failed card      | Error message + retry flow        |

### 6. Integrations

| Criterion                        | How to Verify                       | Proof Artifact            |
| -------------------------------- | ----------------------------------- | ------------------------- |
| All API keys are production keys | Review env vars                     | Env var audit             |
| Email delivery confirmed         | Send test email to external address | Received email screenshot |
| Email not landing in spam        | Check spam folder                   | Screenshot                |
| Third-party webhooks delivering  | Check provider delivery logs        | Delivery log screenshot   |
| Rate limits not exceeded         | Check provider dashboard            | Dashboard screenshot      |

### 7. Deployment

| Criterion                                | How to Verify                    | Proof Artifact       |
| ---------------------------------------- | -------------------------------- | -------------------- |
| CI/CD pipeline green                     | Check pipeline dashboard         | Pipeline screenshot  |
| Deployment rollback path documented      | Review runbook                   | Runbook link or file |
| Rollback tested                          | Execute rollback drill           | Drill result         |
| SSL certificate valid                    | Browser lock icon or SSL checker | SSL report           |
| SSL auto-renewal configured              | Check hosting platform           | Config screenshot    |
| DNS pointing to production               | `nslookup your-domain.com`       | Terminal output      |
| Environment variables set (not defaults) | Audit production env             | Env audit output     |
| Log retention configured                 | Check hosting platform           | Config screenshot    |

### 8. Business Readiness

| Criterion                             | How to Verify                     | Proof Artifact          |
| ------------------------------------- | --------------------------------- | ----------------------- |
| Support contact live                  | Test support email/chat           | Response received       |
| Privacy policy published              | Navigate to /privacy              | Screenshot of live page |
| Terms of service published            | Navigate to /terms                | Screenshot of live page |
| Analytics tracking active             | Check analytics dashboard         | Dashboard screenshot    |
| Error monitoring active               | Trigger test error, check monitor | Alert received          |
| Onboarding flow tested with real user | Invite beta tester                | Feedback received       |

---

## Status Labels

Every criterion must have one of these labels before launch:

| Label       | Meaning                                         |
| ----------- | ----------------------------------------------- |
| **Proven**  | Verified with evidence. Evidence is named.      |
| **Unknown** | Cannot verify without action. Action is named.  |
| **Missing** | Confirmed absent or broken. Blocker for launch. |

### Rules

- **Proven** requires an artifact (output, screenshot, report) — not just confidence
- **Unknown** is NOT acceptable for CRITICAL criteria at launch time
- **Missing** always blocks launch — no exceptions

---

## Proof Artifacts

Completion must be demonstrated, not asserted.

These are valid proof artifacts:

| Type                | Examples                                                     |
| ------------------- | ------------------------------------------------------------ |
| Terminal output     | `curl` response, `git log`, `alembic history`                |
| Screenshots         | Browser showing live page, admin dashboard, monitoring alert |
| Test reports        | Pytest output, Jest coverage report, Lighthouse report       |
| Provider dashboards | Stripe dashboard, Sentry event list, CI pipeline result      |
| Log excerpts        | Production logs showing no ERROR entries during test window  |

These are NOT valid proof artifacts:

- "I checked and it looked fine"
- "It should be working"
- "We deployed yesterday"
- "I think it's set up"

---

## Done Gate Summary

```
PRODUCTION READY = ALL of the following:

✓ Frontend:    All 7 criteria Proven
✓ Backend:     All 6 criteria Proven
✓ Data:        All 4 criteria Proven
✓ Security:    All 6 criteria Proven
✓ Payments:    All 6 criteria Proven (if applicable)
✓ Integrations: All 5 criteria Proven (if applicable)
✓ Deployment:  All 9 criteria Proven
✓ Business:    All 6 criteria Proven

PROOF ARTIFACTS: At least one per CRITICAL criterion
UNKNOWN count:   Zero for CRITICAL criteria
MISSING count:   Zero (any Missing = launch blocked)
```

---

## How This Integrates with the System

1. **Human Outcome Translation Rule** (`.claude/rules/human-outcome-translation.md`):
   Always-on rule that triggers outcome translation on outcome language.

2. **Outcome Translator Skill** (`.skills/custom/outcome-translator/SKILL.md`):
   Produces the structured OUTCOME TRANSLATION output with gap analysis.

3. **CLI Control Plane** (`.claude/rules/cli-control-plane.md`):
   Classifies outcome language as AUDIT or DEPLOY mode, activating appropriate governance.

4. **Verification** (`.skills/custom/verify/SKILL.md` or equivalent):
   Executes the verification gates defined in the execution plan.

---

## Quick Reference Card

```
THE DONE GATES — QUICK REFERENCE
══════════════════════════════════════════════════

"Finished / Done"     = All 8 layers Proven with artifacts
"Ready"               = Finished + monitoring + rollback
"Production Ready"    = Ready + CI green + no dev defaults
"Launch it"           = Production Ready + deployed + DNS confirmed
"Ready for clients"   = Production Ready + user journey + legal + support

NEVER SAY DONE WITHOUT:
  □ Evidence for each criterion
  □ Zero Missing items
  □ Zero Unknown items on CRITICAL criteria

══════════════════════════════════════════════════
```
