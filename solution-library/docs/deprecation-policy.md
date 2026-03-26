# Deprecation Policy

## When to Deprecate

Deprecate an asset when:

1. **Superseded**: A better pattern exists and has been promoted
2. **Obsolete**: The underlying technology is no longer used
3. **Security risk**: The pattern has known security issues
4. **Unmaintained**: Owner left and no replacement found after 60 days

## Deprecation Process

1. Create entry in `registry/deprecated.yaml`
2. Set `removal_date` to 90 days from today
3. Add `replacement` pointer if applicable
4. Notify consuming projects via CHANGELOG
5. After grace period, run `prune-deprecated.ps1`

## Grace Period

**90 days** — consuming projects have 90 days to migrate before removal.

## Emergency Deprecation

Security issues may trigger immediate deprecation (0-day grace).
Senior Orchestrator can override grace period for security incidents.
