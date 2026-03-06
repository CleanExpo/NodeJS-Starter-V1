# Sub-Agent Protocol

> **Layer**: 4 — Isolated task execution. Dispatched by Senior Orchestrator or Specialist Agents.
> **Mandate**: Return evidence, not summaries.

## What Sub-Agents Do

Sub-agents handle isolated, bounded tasks:

- Single file edits
- Targeted searches (grep, glob)
- Proof artifact collection (curl, test run output)
- Data transformation
- Schema validation

Sub-agents do NOT:

- Make architectural decisions
- Coordinate with other agents
- Claim tasks are "done" without evidence
- Load more context than needed for the specific task

## Required Return Format

Every sub-agent MUST return structured evidence. Vague summaries are rejected.

```
EVIDENCE REPORT
═══════════════════════════════════════════════════
Task:     [What was asked]
Status:   COMPLETED | BLOCKED | PARTIAL

ARTIFACTS
─────────────────
EVIDENCE: [artifact type — file, test output, screenshot, curl response]
PATH:     [exact file path or URL]
CONTENT:  [actual content, output, or result — not a summary]
STATUS:   PROVEN | UNKNOWN | BLOCKED

EVIDENCE: [second artifact if applicable]
PATH:     [...]
CONTENT:  [...]
STATUS:   [...]

ISSUES FOUND
─────────────────
[Any problems discovered during execution — do not hide issues]

NEXT REQUIRED ACTION
─────────────────────
[If BLOCKED or PARTIAL: exact next step needed]
═══════════════════════════════════════════════════
```

## Banned Response Patterns

Sub-agents MUST NOT output these phrases (they are rejected automatically):

| Banned Phrase            | Why It's Rejected    |
| ------------------------ | -------------------- |
| "It's done."             | No evidence provided |
| "Looks good."            | Subjective, no proof |
| "Should be working."     | Unverified claim     |
| "I've updated the file." | No content shown     |
| "The tests are passing." | No test output shown |
| "Everything is working." | No evidence          |
| "Complete."              | No proof artifacts   |
| "Finished."              | No verification      |

## Iteration Caps

From `.claude/rules/skills/minions-protocol.md`:

| Node                    | Cap            |
| ----------------------- | -------------- |
| `implement`             | 1 attempt      |
| `fix-ci`                | 2 attempts     |
| `fix-lint`              | 1 attempt      |
| **Total per blueprint** | **3 attempts** |

When the cap is reached: output `BLUEPRINT_ESCALATION` immediately. Do not retry.

## Escalation Triggers

Stop and escalate to the dispatching agent when:

- Iteration cap reached
- Task scope expands beyond the original bounded description
- A HIGH RISK action is required (schema migration, auth change, force push)
- An unexpected file state is discovered (merge conflict, locked file, missing dependency)
- The task cannot be completed without an architectural decision

Escalation format:

```
BLUEPRINT_ESCALATION
Reason:   [specific blocker]
Attempts: [N of cap]
Required: [what the dispatching agent needs to decide]
```

## Context Rules

Sub-agents load ONLY:

- The specific file(s) mentioned in the task
- One level of imports (only if directly needed)
- The exact test file(s) for the component under test

Sub-agents NEVER load:

- Full directory trees
- Unrelated modules
- Documentation not directly referenced in the task

This is Shannon Information Theory in practice: more context = more noise = lower signal quality.
