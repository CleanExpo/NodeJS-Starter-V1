# Standards — Generic code conventions

Universal clean-code patterns that apply regardless of design system, project, or framework. These standards work in any TypeScript or Python codebase and represent the baseline quality that all code should meet.


## Naming principles

Names are the primary documentation of code. A well-named function requires no comment to explain what it does. A well-named variable requires no trace-back to understand what it holds.

### The description test

Every name should pass this test: could a developer who has never seen this codebase understand what the identifier represents, given only its name and its immediate usage context? If the answer is no, the name is too generic or too abbreviated.

`data` fails — it could be anything. `userProfileData` passes — it describes the domain concept. `d` fails — abbreviations strip meaning. `durationMs` passes — the abbreviation is a universally understood unit suffix.

### Length proportional to scope

Variables with narrow scope (loop counters, lambda parameters in short chains) can use shorter names. Variables with wide scope (module-level constants, class properties, function parameters) require longer, more descriptive names. A loop counter `i` inside a 3-line loop is acceptable. A module-level variable named `i` is never acceptable.

### Verb-noun for functions

Functions that perform actions use `verb + noun` naming: `fetchUserProfile`, `calculate_nutrient_totals`, `validateAuthToken`. The verb describes the action; the noun describes the target. Functions that return booleans use `is`, `has`, `can`, or `should` prefixes: `isAuthenticated`, `has_pending_entries`, `canEditProfile`.

### Noun for types and interfaces

Types, interfaces, and classes use noun phrases: `UserProfile`, `NutritionEntry`, `AgentExecutionResult`. Avoid prefixes like `I` for interfaces (`IUser`) — this is a C# convention that does not apply in TypeScript or Python.


## Function design

### Single responsibility

A function does one thing. If its name requires the word "and" to describe what it does, it should be two functions. `validateAndSaveUser` is two functions: `validateUser` and `saveUser`. The caller composes them.

### Parameter count

Functions with more than three parameters should accept an options object (TypeScript) or keyword arguments (Python). Long parameter lists are hard to read at the call site and easy to get wrong.

```typescript
// Avoid
function createUser(name: string, email: string, role: string, verified: boolean, org: string) {}

// Prefer
interface CreateUserOptions {
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  organisationId: string;
}
function createUser(options: CreateUserOptions) {}
```

### Return early

Handle error conditions and edge cases at the top of the function. The main logic runs at the lowest indentation level. This makes the happy path immediately visible and eliminates the pyramid of nested conditionals.

```typescript
function processPayment(payment: Payment): PaymentResult {
  if (!payment.amount || payment.amount <= 0) {
    return { success: false, error: 'Invalid payment amount' };
  }
  if (!payment.methodId) {
    return { success: false, error: 'Payment method required' };
  }

  // Happy path at top indentation level
  const charge = createCharge(payment);
  return { success: true, chargeId: charge.id };
}
```


## Type safety

### TypeScript

Every function parameter and return type must be explicitly annotated. Inferred types are acceptable for local variables where the type is obvious from the assignment, but function boundaries must be explicit because they form the API contract.

`any` is banned except at FFI boundaries where the external type genuinely cannot be expressed. In those rare cases, narrow `any` to a specific type as close to the boundary as possible, and document the reason.

`unknown` is the safe alternative to `any`. It forces the consumer to narrow the type before using it:

```typescript
function parseExternalPayload(raw: unknown): AgentConfig {
  if (!isAgentConfig(raw)) {
    throw new Error('Invalid agent configuration payload');
  }
  return raw;
}
```

### Python

Type hints on all public function signatures. Use `typing` module constructs for complex types: `Optional`, `Union`, `TypedDict`, `Protocol`. Runtime type checking is not required, but type annotations enable IDE support and static analysis.

```python
def calculate_nutrient_totals(entries: list[NutritionEntry]) -> NutrientSummary:
    """Aggregate nutrient values across all entries for a single day."""
    ...
```


## Error handling

### Specific exceptions

Catch specific exceptions, never bare `except:` or `catch (e) {}`. Each catch block should handle a known failure mode and either recover or translate the error into a domain-appropriate form.

```python
# Avoid
try:
    result = execute_query(sql)
except:
    return None

# Prefer
try:
    result = execute_query(sql)
except ConnectionError as exc:
    logger.error("database_connection_failed", error=str(exc))
    raise ServiceUnavailableError("Database is temporarily unavailable") from exc
```

### Error messages

Error messages describe what went wrong and, when possible, what the user can do about it. "Failed to connect to database at localhost:5432 — is PostgreSQL running?" is better than "Connection error".


## Imports

### Named imports

Import specific identifiers, not entire modules. Named imports make dependencies explicit, enable tree-shaking, and make it easy to see what a file uses from each module.

```typescript
import { formatDate, parseISODate } from './date-utils';
import type { UserProfile } from './types';
```

### Import ordering

Group imports by source, separated by blank lines:

1. Standard library / built-in modules
2. Third-party packages
3. Internal project modules
4. Relative imports from the current package

Within each group, sort alphabetically. Most formatters and linters enforce this automatically.

### Type-only imports

In TypeScript, use `import type` for identifiers that are only used in type positions. This ensures they are erased at compile time and do not contribute to bundle size.


## Constants

### Naming

Constants use `SCREAMING_SNAKE_CASE` in both TypeScript and Python. The name describes the constant's purpose, not its value: `MAX_RETRY_ATTEMPTS` rather than `THREE`, `SESSION_TIMEOUT_MS` rather than `THIRTY_THOUSAND`.

### Placement

Constants used within a single function are declared at the top of that function. Constants shared across a module are declared at the top of the file, after imports. Constants shared across the application belong in a dedicated configuration module.

### Numeric separators

Large numbers use numeric separators for readability: `30_000` rather than `30000`, `1_000_000` rather than `1000000`. TypeScript supports underscores as numeric separators; Python uses the same syntax.


## Comments

### When to comment

Comment the WHY, never the WHAT. The code shows what happens; comments explain why it happens that way. Good comment targets include:

- Business rules that are not obvious from the code
- Performance optimisations that sacrifice readability
- Workarounds for known bugs in dependencies
- Constraints imposed by external systems
- The reason a non-obvious approach was chosen over the obvious one

### Documentation comments

Public functions, classes, and modules get documentation comments (JSDoc in TypeScript, docstrings in Python) that describe the function's purpose, parameters, and return value. Internal helper functions do not require documentation comments if their name and signature are sufficiently descriptive.

### TODO format

TODOs include context: who, what, why, and a tracking reference if one exists. `// TODO(auth): Replace bcrypt with Argon2 — BEAD-234` is actionable. `// TODO: fix later` is not.
