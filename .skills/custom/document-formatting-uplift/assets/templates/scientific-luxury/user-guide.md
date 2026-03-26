---
title: [Guide title in sentence case]
created: DD/MM/YYYY
modified: DD/MM/YYYY
status: draft
author: [Author or team]
locale: en-AU
design-system: scientific-luxury
---

# [Guide title]

<!-- One sentence stating what the reader will be able to do after completing this guide.
     Example: "This guide walks through deploying the application to a production AWS
     environment with SSL termination and automated health checks." -->


## Goal

<!-- A single paragraph explaining the outcome of following this guide. State the end state
     concretely: what will exist, what will be running, what the reader will have configured.
     Do not describe the guide itself — describe the result.

     Status annotations use the spectral palette:
     [ACTIVE] for running services
     [COMPLETE] for finished configuration steps
     [WARNING] for steps that require extra attention
     [ERROR] for known failure points -->


## Prerequisites

<!-- List what the reader must have before starting. This is one of the few places where
     a bullet list is appropriate — prerequisites are genuinely unordered and independent.
     Each item should be verifiable: include a command the reader can run to confirm. -->

- [Prerequisite] — verify with `[command]`
- [Prerequisite] — verify with `[command]`
- [Prerequisite] — verify with `[command]`


## Steps

<!-- Numbered steps in the order they must be performed. Each step is a short heading (H3)
     followed by prose explaining what to do and why. Include the exact commands in code
     blocks with the correct language identifier.

     Do not explain what the reader will do in the next step — they will read it when they
     get there. Each step should be self-contained: context, action, verification. -->

### 1. [First step title]

<!-- Prose explaining what this step accomplishes and any context the reader needs.
     Then the command or action. Then how to verify it worked. -->

```bash
# Command to execute
```

Expected output or verification:

```text
[What the reader should see]
```

### 2. [Second step title]

<!-- Same structure: context, action, verification. -->

### 3. [Third step title]

<!-- Continue for all steps. A typical guide has 4-8 steps. If you have more than 10,
     consider splitting into multiple guides or grouping steps into phases. -->


## Verification

<!-- After all steps are complete, provide a single comprehensive verification that proves
     the guide's goal has been achieved. This should be a concrete action with an observable
     result — not "confirm everything is working" but "run this command and verify this
     specific output". -->

```bash
# Comprehensive verification command
```


## Troubleshooting

<!-- Address the failure modes that actual users encounter. Each issue gets an H3 heading
     with the symptom as the heading text (what the user sees), not the cause (what is
     actually wrong). Users search for symptoms, not causes.

     Under each heading: one paragraph explaining the cause, then the fix. -->

### [Symptom the user sees]

<!-- What causes this and how to fix it. Be specific — include the exact command or
     configuration change. -->

### [Another symptom]

<!-- Same structure. Aim for 3-5 troubleshooting entries covering the most common
     failure modes. Do not attempt to be exhaustive — cover the issues that affect
     more than 10% of users. -->
