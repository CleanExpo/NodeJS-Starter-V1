---
id: code-output-uplift
name: code-output-uplift
type: rigid
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
metadata:
  author: NodeJS-Starter-V1
  locale: en-AU
description: >
  Override generic LLM code output patterns. Replaces generic variable names,
  over-commented code, and placeholder patterns with domain-specific naming,
  clean architecture, and production-ready structure.
---

# Code output uplift

LLMs produce code with predictable failure modes: generic variable names (`data`, `result`, `response`), comments that restate what the code does rather than why, untyped parameters disguised behind `any`, and American English in user-facing strings. This skill replaces those defaults with domain-specific naming, intentional commenting, strict typing, and en-AU compliance.

The skill is rigid. Every piece of code produced under its governance must pass the eval criteria at the end of this file. There are no soft recommendations here — each rule exists because its violation is detectable and its correction is measurable.


## When to apply

### Positive triggers

Activate this skill when the task involves improving or reviewing code quality:

- "code quality", "naming conventions", "clean code"
- "code style", "variable naming", "code review"
- "refactor for quality"
- Any task where the primary goal is improving existing code structure, naming, or readability

### Negative triggers

Do not activate for tasks where a different skill is the primary driver:

- Task initiation or feature creation (use `idea-to-production` or `genesis-orchestrator`)
- UI design, animation, or visual styling (use `scientific-luxury`)
- Algorithm optimisation or complexity analysis (use `council-of-logic`)
- Document formatting or technical writing (use `document-formatting-uplift`)
- Test-driven development workflow (use `tdd`)

### Priority

This skill activates after `council-of-logic` (which governs algorithmic decisions) and before `execution-guardian` (which governs safety checks). The council determines the right algorithm; this skill determines how that algorithm is expressed in code.


## Banned defaults

Twelve anti-patterns that LLMs produce by default. Each is banned unconditionally.

| # | Banned pattern | Why it fails | Replacement |
|---|---------------|-------------|-------------|
| 1 | Generic names: `data`, `result`, `response`, `item`, `temp`, `val`, `obj`, `arr`, `str`, `num` | Communicates nothing about the domain; forces the reader to trace the variable's origin to understand its content | Domain-specific names that describe what the value represents: `userProfile`, `agentExecutionResult`, `authTokenPayload` |
| 2 | Comments restating what the code does: `// increment counter` above `i++` | Doubles the reading time without adding information; the code already says what it does | Comments explaining why: `// Skip first element — it's the header row` or no comment at all |
| 3 | `console.log` in production code | Pollutes stdout, leaks data, provides no structured context for debugging | Structured logging: `logger.info('Agent execution completed', { agentId, durationMs, tokenCount })` |
| 4 | `any` types without justification | Disables the type system at the boundary where it matters most; errors surface at runtime instead of compile time | `unknown` with a type guard, or a specific interface/type definition |
| 5 | American English in user-facing strings | Violates the project's en-AU locale requirement | Australian English: "colour", "behaviour", "optimisation", "organisation", "licence" (noun) |
| 6 | Placeholder TODOs without context: `// TODO: fix this` | Provides no information about what needs fixing, who should fix it, or when | Contextual TODOs: `// TODO(auth): Replace with OAuth flow — blocked on provider setup (BEAD-142)` or remove entirely |
| 7 | Dead code left in place: commented-out blocks, unreachable branches | Clutters the file, misleads readers about active behaviour, inflates diffs | Delete it. Version control preserves history. |
| 8 | Functions exceeding 50 lines | Signals the function handles multiple responsibilities; harder to test, harder to name, harder to reason about | Extract sub-functions with descriptive names that document the decomposition |
| 9 | Deeply nested conditionals (more than 3 levels) | Each nesting level doubles the cognitive load for the reader; the happy path becomes invisible | Early returns, guard clauses, or extracted predicate functions |
| 10 | Magic numbers and strings | The reader cannot determine why the value is what it is; changes require hunting through the codebase | Named constants: `const MAX_RETRY_ATTEMPTS = 3`, `const SESSION_TIMEOUT_MS = 1800000` |
| 11 | Inconsistent naming within a file | Mixing `camelCase` and `snake_case` in the same TypeScript file, or `PascalCase` and `camelCase` for the same concept | One convention per language: `camelCase` for TypeScript identifiers, `snake_case` for Python identifiers |
| 12 | Import-all patterns: `import * as utils from './utils'` | Defeats tree-shaking, obscures which specific utilities are used, makes refactoring dangerous | Named imports: `import { formatCurrency, parseDate } from './utils'` |

Reference: See `references/anti-patterns.md` for full before/after examples of each pattern.


## Replacement standards

These rules govern all code output when this skill is active.

### Domain-specific naming

Every variable, function, and type name must describe what it represents in the problem domain, not what it is in the programming language. A function that fetches a user's profile from the database is `fetchUserProfile`, not `getData`. A variable holding the result of an agent execution is `agentExecutionResult`, not `result`. A list of unprocessed nutrition entries is `pendingNutritionEntries`, not `items`.

The naming test is simple: could a developer unfamiliar with the codebase understand what the variable holds without reading its assignment? If not, the name is too generic.

### Comments for WHY, not WHAT

A comment that restates the code is worse than no comment — it adds reading time while contributing nothing. Comments exist to explain intent, constraints, and non-obvious decisions. "Increment counter" above `i++` fails this test. "Skip index 0 — the CSV header row is not a data record" passes because it explains a decision that the code alone does not convey.

When a block of code needs a WHAT comment to be readable, the code itself needs to be rewritten with better names and structure until the WHAT is self-evident.

### Zero `any` without justification

TypeScript's `any` type is a trapdoor that silently disables type checking across call boundaries. Every `any` in a function signature, variable declaration, or type assertion must be replaced with either:

- A specific type or interface that describes the shape
- `unknown` paired with a type guard that narrows the type at the usage site
- A justified exception documented with a comment explaining why the type cannot be expressed (rare — typically only at FFI boundaries or with genuinely polymorphic third-party libraries)

### en-AU enforcement

All user-facing strings, comments, error messages, and documentation within code must use Australian English spelling. This applies to variable names only when they appear in user-visible contexts (log messages, error strings, UI text). Internal variable names follow domain conventions regardless of spelling variant.

### Functions under 50 lines

A function that exceeds 50 lines is handling multiple responsibilities. Extract coherent sub-operations into named functions. The extracted function's name serves as documentation for what that block of code does — a form of self-documenting code that is more maintainable than comments.

### Early returns over nesting

Replace nested conditionals with guard clauses that exit early for invalid or edge-case conditions. The main logic should run at the lowest indentation level, making the happy path immediately visible. A function with three levels of `if` nesting should be refactored to handle error conditions first and then proceed with the core logic at the top level.

### Named constants

Every literal value that is not self-evidently obvious (0, 1, true, false, empty string) must be a named constant. The constant's name documents the value's purpose: `const AGENT_TIMEOUT_MS = 30000` communicates both the value and its meaning. `30000` alone communicates nothing.

### Consistent conventions

TypeScript files use `camelCase` for variables, functions, and methods; `PascalCase` for types, interfaces, and React components; `SCREAMING_SNAKE_CASE` for constants. Python files use `snake_case` for variables, functions, and methods; `PascalCase` for classes; `SCREAMING_SNAKE_CASE` for constants. Never mix conventions within a file.


## Naming conventions

| Context | Convention | Example |
|---------|-----------|---------|
| React components | `PascalCase.tsx` | `AgentDashboard.tsx`, `NutritionChart.tsx` |
| React hooks | `use{Domain}{Action}` | `useAgentStatus`, `useNutritionEntries` |
| TypeScript utilities | `kebab-case.ts` | `format-currency.ts`, `parse-agent-response.ts` |
| Python modules | `snake_case.py` | `agent_executor.py`, `nutrition_service.py` |
| Python functions | `snake_case` | `calculate_nutrient_totals`, `fetch_agent_state` |
| Test files (TS) | `{Component}.test.tsx` | `AgentDashboard.test.tsx` |
| Test files (Python) | `test_{module}.py` | `test_agent_executor.py` |
| Variables (TS) | Domain-specific `camelCase` | `agentExecutionResult`, `pendingNutritionEntries` |
| Variables (Python) | Domain-specific `snake_case` | `agent_execution_result`, `pending_nutrition_entries` |
| Constants (both) | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS`, `SESSION_TIMEOUT_MS` |
| Types/Interfaces | `PascalCase` | `AgentExecutionResult`, `NutritionEntry` |
| API route handlers | `verb + Resource` | `createAgent`, `get_nutrition_entries` |

### Domain prefixes in this project

Variables and functions should use domain prefixes drawn from the project's bounded contexts:

- `agent_` / `agent` — AI agent execution, state, coordination
- `auth_` / `auth` — Authentication and authorisation flows
- `nutrition_` / `nutrition` — Nutrition tracking domain (if applicable)
- `session_` / `session` — User session management
- `graph_` / `graph` — LangGraph state and execution


## en-AU enforcement

All code produced under this skill must use Australian English in:

- User-facing strings: error messages, UI text, log messages
- Comments and documentation within code files
- Docstrings and JSDoc annotations

Spelling: colour, behaviour, optimisation, organised, licence (noun), analyse, centre, defence, honour, programme (but "program" for software variables).

Internal identifiers follow the language ecosystem's conventions (American English is acceptable for variable names that mirror library APIs, e.g., `color` in CSS-in-JS contexts where the library uses American spelling).


## Eval criteria

Every code file produced under this skill must pass all eight checks. A single failure means the code requires revision.

| # | Criterion | PASS condition |
|---|----------|---------------|
| 1 | Domain-specific naming | Zero instances of `data`, `result`, `response`, `item`, `temp`, `val`, `obj`, `arr` as standalone variable names. Every name describes what it represents in the domain. |
| 2 | Comments for WHY | No comments that restate what the code does. Every comment explains intent, constraints, or non-obvious decisions. |
| 3 | No unstructured logging | Zero `console.log` statements in production code. All logging uses structured logger with context objects. |
| 4 | Type safety | Zero `any` types without an inline justification comment. All function parameters and return types are explicitly typed. |
| 5 | en-AU compliance | All user-facing strings, error messages, and comments use Australian English spelling. |
| 6 | Function size | No function exceeds 50 lines. Functions with multiple responsibilities are decomposed. |
| 7 | Nesting depth | No conditional nesting deeper than 3 levels. Guard clauses and early returns used for edge cases. |
| 8 | Named constants | No magic numbers or strings. All non-obvious literal values are named constants with descriptive names. |

Run this checklist mentally before declaring any code task complete. If any criterion fails, fix it before delivering.
