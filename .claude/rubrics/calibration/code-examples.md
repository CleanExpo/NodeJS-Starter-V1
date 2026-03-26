---
name: code-calibration-examples
type: calibration
version: 1.0.0
created: 26/03/2026
---

# Code Rubric Calibration Examples

Few-shot scoring anchors for qa-validator and verification agents. Use these to calibrate scoring consistency.

## 1. Test Coverage

### Score 20 — TDD Exemplar
```typescript
// apps/web/__tests__/components/UserProfile.test.tsx
// Written BEFORE implementation — TDD cycle followed

describe('UserProfile', () => {
  it('renders user name and email', () => { /* specific assertions */ });
  it('shows loading skeleton while fetching', () => { /* skeleton visible */ });
  it('shows error state on API failure', () => { /* error message rendered */ });
  it('shows empty state for new users', () => { /* onboarding CTA visible */ });
  it('handles special characters in names', () => { /* unicode edge case */ });
  it('truncates extremely long email addresses', () => { /* overflow handling */ });
});
// Evidence: git log shows test committed BEFORE implementation
```

### Score 10 — Tests Exist but Gaps
```typescript
describe('UserProfile', () => {
  it('renders user name', () => { /* only happy path */ });
  // Missing: loading state, error state, empty state, edge cases
});
```

### Score 0 — No Tests
```typescript
// No test file exists for UserProfile component
// Implementation shipped without any test coverage
```

## 2. Type Safety

### Score 20 — Full Coverage
```typescript
// Strict mode passing, zero 'any' types
interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}

function getUserById(id: string): Promise<UserProfile | null> {
  // Explicit return type, no 'any'
}
```

### Score 10 — Moderate Gaps
```typescript
function getUserById(id: string): Promise<any> {
  // 'any' return type hides the actual shape
}
```

### Score 0 — No Type Safety
```typescript
function getUserById(id) {
  // No parameter types, no return type
  // @ts-ignore scattered throughout
}
```

## 3. Error Handling

### Score 20 — Comprehensive
```typescript
try {
  const user = await UserService.getById(id);
  if (!user) throw new NotFoundError('User', id);
  return NextResponse.json({ data: user });
} catch (error) {
  console.error('[UserAPI] GET failed:', { id, error });
  return handleApiError(error);
}
```

### Score 10 — Partial
```typescript
try {
  const user = await UserService.getById(id);
  return NextResponse.json({ data: user });
} catch (error) {
  // No logging, no specific error types
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
```

### Score 0 — None
```typescript
// No try/catch, no error handling
const user = await UserService.getById(id);
return NextResponse.json({ data: user });
```

## 4. Module Isolation

### Score 20 — Clean Boundaries
```
apps/web/components/user/   → imports from hooks/ and lib/ only
apps/web/hooks/user/        → imports from lib/api/ only
apps/web/lib/api/           → imports from client.ts only
// Zero circular dependencies. Each layer imports only from the layer below.
```

### Score 10 — Some Coupling
```
apps/web/components/user/UserProfile.tsx
  → imports from apps/web/lib/api/client.ts (skipping hooks layer)
  → imports from apps/backend/src/types/ (cross-app boundary violation)
```

### Score 0 — Spaghetti
```
apps/web/components/ imports from apps/backend/src/
apps/backend/src/ imports from apps/web/lib/
Circular: A → B → C → A
```

## 5. Performance & Locale

### Score 20 — Optimal
```typescript
// O(n) lookup using Map instead of nested loops
const userMap = new Map(users.map(u => [u.id, u]));
// en-AU strings: "colour", "behaviour", "optimisation"
// DD/MM/YYYY date format enforced
// Lazy loading: const UserProfile = dynamic(() => import('./UserProfile'));
```

### Score 10 — Acceptable with Issues
```typescript
// O(n²) nested filter — works but doesn't scale
const matches = users.filter(u => roles.find(r => r.userId === u.id));
// Mixed locale: "color" in some strings, "colour" in others
```

### Score 0 — Severe Issues
```typescript
// N+1 query pattern inside a loop
for (const user of users) {
  const role = await db.query('SELECT * FROM roles WHERE user_id = ?', [user.id]);
}
// American English throughout: "color", "behavior", "optimization"
```
