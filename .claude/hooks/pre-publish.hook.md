---
id: pre-publish
name: pre-publish
type: hook
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
priority: 1
blocking: true
---


# Pre-Publish Hook (BLOCKING)

**CRITICAL**: Blocks content publication without Truth Finder verification.

## Trigger Conditions

- Content publishing to website
- Blog posts going live
- Video scripts finalized
- Marketing materials approved
- Documentation released

## Actions

1. **Invoke Truth Finder Agent**
   ```
   Load: .claude/agents/truth-finder/agent.md
   Execute: Content verification pipeline
   ```

2. **Check Confidence Score**
   ```
   IF confidence >= 75%: PASS
   IF confidence < 75%: REQUIRE HUMAN REVIEW
   IF critical claims unverified: BLOCK
   ```

3. **Generate Citations**
   - Format citations for content type
   - Add source bibliography
   - Include verification metadata

4. **Apply Australian Context (Final Check)**
   - Verify en-AU spelling
   - Check date formats (DD/MM/YYYY)
   - Validate regulatory references

## On Failure

**BLOCK PUBLICATION**

Generate detailed report:
- Overall confidence score
- Unverified claims list
- Suggested sources
- Required actions

**Require human approval to override**

## Never Bypass

NO content goes live without truth verification. This is non-negotiable.

## Integration

Called automatically before any content publication action.
