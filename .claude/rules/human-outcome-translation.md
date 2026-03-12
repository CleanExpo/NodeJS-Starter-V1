# Human Outcome Translation Rule

> **Authority**: Always-on. Applies whenever a user speaks in end-goal or outcome language.
> **Locale**: en-AU — colour, behaviour, optimisation, organised, licence (noun).

---

## Trigger Patterns

Activate this rule when the user says any of the following (or semantically equivalent phrases):

| Phrase              | Meaning                                                          |
| ------------------- | ---------------------------------------------------------------- |
| "Finished"          | Deliver a production-ready system                                |
| "Ready"             | All gates passed; ready to ship                                  |
| "Launch it"         | Deploy to production with all dependencies                       |
| "Make it work"      | Diagnose and fix the gap between current state and working state |
| "Production ready"  | Full production checklist verified                               |
| "Ready for clients" | End-to-end user journey verified with real credentials           |
| "Ship it"           | Deploy with rollback path                                        |
| "Done"              | All acceptance criteria met with proof                           |
| "Go live"           | Production deployment + monitoring active                        |
| "Just make it work" | Root-cause analysis + fix + verification                         |

---

## Translation Protocol

When a trigger phrase is detected, do NOT take any action until the following output is produced:

```
OUTCOME TRANSLATION
═══════════════════════════════════════════════════
Outcome:          [What the user said]
Interpreted As:   [Engineering definition]

DEFINITION OF DONE
─────────────────
□ [Criterion 1]
□ [Criterion 2]
□ [Criterion N]

CURRENT STATE AUDIT
─────────────────
Proven:   [List what has been confirmed to work, with evidence]
Unknown:  [List what cannot be verified without running the system]
Missing:  [List what is confirmed absent or broken]

EXECUTION PLAN
─────────────
Phase 1: [Title]
  Steps: [...]
  Gate:  [Verification command or artifact]

Phase 2: [Title]
  Steps: [...]
  Gate:  [Verification command or artifact]

PROOF REQUIRED
─────────────
Before claiming completion, provide:
  □ [Artifact 1 — e.g. screenshot, curl output, test result]
  □ [Artifact 2]
  □ [Artifact N]

NEXT ACTION
─────────────
[Single most important action to take right now]
═══════════════════════════════════════════════════
```

---

## Default Definition of "Finished"

Unless the user specifies otherwise, "Finished" means a **production-ready SaaS** with ALL of the following verified:

### Frontend

- [ ] Production URL responds with HTTP 200
- [ ] All primary pages load without console errors
- [ ] Auth flows work (register, login, logout, protected routes)
- [ ] No critical 404 errors on any linked asset
- [ ] Responsive layout verified on mobile and desktop
- [ ] All user-facing copy is correct and finalised

### Backend

- [ ] All API endpoints respond within acceptable latency
- [ ] Health check endpoint returns 200
- [ ] Authentication middleware is active and rejecting invalid tokens
- [ ] No unhandled exceptions in production logs
- [ ] Database migrations are applied

### Data

- [ ] Production database is seeded with required reference data
- [ ] No development/test data in production
- [ ] Backup schedule is configured

### Security

- [ ] Environment variables are set (no `.env` in production git)
- [ ] CORS is restricted to production domain
- [ ] JWT secret is rotated from default
- [ ] Rate limiting is active on auth endpoints

### Payments (if applicable)

- [ ] Payment provider is in live mode (not test mode)
- [ ] Webhook endpoint is configured and verified
- [ ] At least one successful test transaction confirmed
- [ ] Refund flow tested

### Integrations

- [ ] All third-party API keys are production keys (not dev/sandbox)
- [ ] Webhook deliveries confirmed in provider dashboard
- [ ] Email delivery verified (not landing in spam)

### Deployment

- [ ] CI/CD pipeline is green
- [ ] Deployment rollback path documented and tested
- [ ] SSL certificate is valid and auto-renewing
- [ ] Domain DNS is pointing to production infrastructure

### Business Readiness

- [ ] Support contact method is live
- [ ] Privacy policy and terms of service are published
- [ ] Analytics tracking is active
- [ ] Error monitoring (e.g. Sentry) is configured

---

## UNKNOWN Handling

If any criterion **cannot be verified** without running the live system, it MUST be labelled:

```
UNKNOWN — requires [specific action to verify, e.g. "run curl against production URL"]
```

Never claim a criterion is met without evidence. Never assume.

---

## Completion Prohibition

The system MUST NOT output phrases such as:

- "Done!"
- "That's complete."
- "Everything is working."
- "You're production ready."

...unless ALL of the following are true:

1. Every Definition of Done criterion has a `Proven` status
2. At least one proof artifact has been provided for each critical criterion
3. No criterion is labelled `Unknown` or `Missing`

If any criterion remains unverified, the output must say:

```
NOT COMPLETE — [N] criteria are UNKNOWN or MISSING.
Next required action: [specific step]
```

---

## Integration with CLI Control Plane

This rule integrates with the CLI Control Plane (`cli-control-plane.md`):

- Outcome translation triggers **AUDIT** mode classification
- Execution plans generated here feed into **MIGRATE** or **DEPLOY** governance
- All HIGH RISK items (auth changes, production deploys, schema migrations) require explicit confirmation before proceeding

---

## Example

**User says**: "Ready for clients"

**System outputs**:

```
OUTCOME TRANSLATION
═══════════════════════════════════════════════════
Outcome:          "Ready for clients"
Interpreted As:   End-to-end user journey verified; production infrastructure live

DEFINITION OF DONE
─────────────────
□ Production URL responds with HTTP 200
□ Client can register and receive verification email
□ Client can log in and access their dashboard
□ Payment flow works end-to-end (if applicable)
□ No console errors on critical paths
□ Support contact is reachable

CURRENT STATE AUDIT
─────────────────
Proven:   CI pipeline is green (last run: [date])
Unknown:  Production URL response — needs live verification
Unknown:  Email delivery — needs test send to external address
Missing:  SSL certificate status — not confirmed
Missing:  Production payment keys — not confirmed set

EXECUTION PLAN
─────────────
Phase 1: Infrastructure verification
  Steps: curl production URL, check SSL, verify DNS
  Gate:  HTTP 200 + valid SSL cert

Phase 2: Auth flow verification
  Steps: Register test user, check email, login, access dashboard
  Gate:  JWT cookie set, dashboard renders

Phase 3: Payment verification (if applicable)
  Steps: Switch to live keys, run test transaction
  Gate:  Transaction appears in provider dashboard

PROOF REQUIRED
─────────────
□ Screenshot of production homepage (HTTP 200)
□ Screenshot of successful login
□ Provider dashboard showing test transaction

NEXT ACTION
─────────────
Run: curl -I https://your-production-url.com
═══════════════════════════════════════════════════
```
