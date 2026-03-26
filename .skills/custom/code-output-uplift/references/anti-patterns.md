# Anti-patterns reference

Detailed before/after examples for each of the 12 banned code output patterns. Use these to calibrate detection and correction.


## 1. Generic variable names

**Before**:
```typescript
async function getData(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  const result = data.items.map((item: any) => ({
    name: item.name,
    value: item.score,
  }));
  return result;
}
```

**Why it fails**: Every variable name (`data`, `response`, `result`, `item`) describes the programming construct rather than the domain concept. A developer reading this function cannot determine what kind of data is being fetched, what the items represent, or what the result will be used for without tracing through the call site.

**After**:
```typescript
async function fetchUserPerformanceScores(userId: string): Promise<UserScore[]> {
  const httpResponse = await fetch(`/api/users/${userId}`);
  const userProfilePayload = await httpResponse.json();
  const performanceScores = userProfilePayload.assessments.map(
    (assessment: UserAssessment) => ({
      assessmentName: assessment.name,
      normalisedScore: assessment.score,
    })
  );
  return performanceScores;
}
```

**Detection cue**: Variables named `data`, `result`, `response`, `item`, `temp`, `val`, `obj`, `arr`, `str`, `num` used as standalone identifiers (not as suffixes like `responseBody` or `resultCount`).


## 2. Comments restating the code

**Before**:
```typescript
// Get the user
const user = await getUser(id);

// Check if user exists
if (!user) {
  // Return 404
  return res.status(404).json({ error: 'Not found' });
}

// Update the user's name
user.name = newName;

// Save the user
await user.save();

// Return the updated user
return res.status(200).json(user);
```

**Why it fails**: Every comment restates the line below it. A developer can read `const user = await getUser(id)` without a comment explaining that it gets the user. These comments double the visual noise of the function without adding any information that the code does not already convey.

**After**:
```typescript
const user = await getUser(id);
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

// Bypass validation — admin name changes are pre-validated by the RBAC layer
user.name = newName;
await user.save();

return res.status(200).json(user);
```

**Detection cue**: Comments that use the same verbs and nouns as the code line they precede. "Get the user" above `getUser()`, "Save the result" above `result.save()`, "Check if X" above `if (!X)`.


## 3. `console.log` in production code

**Before**:
```typescript
async function executeAgent(agentId: string, input: string) {
  console.log('Starting agent execution');
  console.log('Agent ID:', agentId);
  console.log('Input:', input);

  try {
    const result = await agent.run(input);
    console.log('Agent completed successfully');
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.log('Agent failed:', error);
    throw error;
  }
}
```

**Why it fails**: `console.log` produces unstructured text output that cannot be filtered, aggregated, or queried. In production, these logs mix with legitimate output, making debugging harder rather than easier. The `input` and `result` may contain sensitive data that gets written to stdout without redaction.

**After**:
```typescript
async function executeAgent(agentId: string, input: string): Promise<AgentOutput> {
  const startTime = performance.now();
  logger.info('Agent execution started', { agentId, inputLength: input.length });

  try {
    const agentOutput = await agent.run(input);
    const durationMs = Math.round(performance.now() - startTime);
    logger.info('Agent execution completed', { agentId, durationMs, tokenCount: agentOutput.usage.totalTokens });
    return agentOutput;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.error('Agent execution failed', { agentId, durationMs, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
```

**Detection cue**: Any `console.log`, `console.warn`, `console.error`, or `console.debug` statement outside of a development-only utility, CLI tool, or test file.


## 4. `any` types without justification

**Before**:
```typescript
function processData(data: any): any {
  const items: any[] = data.entries;
  return items.filter((item: any) => item.active).map((item: any) => ({
    id: item.id,
    label: item.name,
  }));
}
```

**Why it fails**: Five instances of `any` completely disable type checking. If `data.entries` does not exist, the error surfaces at runtime. If an `item` lacks an `active` property, the filter silently returns nothing. The function signature tells the caller nothing about what to pass in or what to expect back.

**After**:
```typescript
interface NutritionEntry {
  id: string;
  name: string;
  active: boolean;
  calories: number;
}

interface NutritionEntriesPayload {
  entries: NutritionEntry[];
  totalCount: number;
}

interface NutritionLabel {
  id: string;
  label: string;
}

function extractActiveNutritionLabels(payload: NutritionEntriesPayload): NutritionLabel[] {
  return payload.entries
    .filter((entry) => entry.active)
    .map((entry) => ({
      id: entry.id,
      label: entry.name,
    }));
}
```

**Detection cue**: The keyword `any` appearing in function parameters, return types, variable declarations, or type assertions. Also watch for implicit `any` from missing type annotations on function parameters.


## 5. American English in user-facing strings

**Before**:
```typescript
throw new Error('Authorization failed: invalid credentials');
logger.info('Color scheme initialized successfully');
toast.warning('Your organization settings need to be updated');
```

**Why it fails**: The project locale is en-AU. "Authorization", "Color", and "organization" are American English spellings. User-facing text, error messages, and log messages must use Australian English to maintain consistency across the application.

**After**:
```typescript
throw new Error('Authorisation failed: invalid credentials');
logger.info('Colour scheme initialised successfully');
toast.warning('Your organisation settings need to be updated');
```

**Detection cue**: American spellings in string literals: "color" (colour), "behavior" (behaviour), "optimize" (optimise), "organize" (organise), "authorize" (authorise), "license" as a noun (licence), "center" (centre), "defense" (defence).


## 6. Placeholder TODOs without context

**Before**:
```typescript
// TODO: fix this
function calculateTotal(items: CartItem[]): number {
  // TODO: handle edge cases
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
    // TODO: add discount logic
  }
  return total;
}
```

**Why it fails**: None of these TODOs provide enough context for any developer (including the author, a week later) to act on them. "Fix this" does not say what is broken. "Handle edge cases" does not say which edges. "Add discount logic" does not say what discount rules exist or where they are documented.

**After**:
```typescript
function calculateCartTotal(cartItems: CartItem[]): number {
  // TODO(pricing): Apply tiered discount rules from PricingService — blocked on BEAD-87
  const subtotal = cartItems.reduce(
    (runningTotal, cartItem) => runningTotal + cartItem.unitPrice * cartItem.quantity,
    0
  );
  return subtotal;
}
```

**Detection cue**: TODO comments that contain fewer than 10 words, or that use generic phrases like "fix this", "handle this", "implement later", "do something here".


## 7. Dead code left in place

**Before**:
```typescript
function renderDashboard(user: User) {
  // const oldLayout = getOldLayout(user);
  // if (user.betaAccess) {
  //   return renderBetaLayout(user);
  // }
  const layout = getLayout(user);

  // NOTE: removed 2024-01-15, keeping for reference
  // const widgets = loadWidgets(user.preferences);
  // widgets.forEach(w => w.init());

  return renderLayout(layout, user);
}
```

**Why it fails**: Commented-out code signals uncertainty — someone was not confident enough to delete it, so they left it as a safety net. This creates visual clutter, misleads readers about what the function actually does, and the commented code rots as the surrounding code evolves. Version control already preserves every previous version of the file.

**After**:
```typescript
function renderDashboard(user: User) {
  const dashboardLayout = getDashboardLayout(user);
  return renderLayout(dashboardLayout, user);
}
```

**Detection cue**: Consecutive lines of commented-out code (more than one line), or comments containing code-like syntax (function calls, variable assignments, control flow).


## 8. Functions exceeding 50 lines

**Before**:
```typescript
async function handleUserRegistration(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email) { return res.status(400).json({ error: 'Email required' }); }
  if (!password) { return res.status(400).json({ error: 'Password required' }); }
  if (password.length < 8) { return res.status(400).json({ error: 'Password too short' }); }
  if (!name) { return res.status(400).json({ error: 'Name required' }); }
  const existingUser = await db.users.findByEmail(email);
  if (existingUser) { return res.status(409).json({ error: 'Email taken' }); }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await db.users.create({ email, password: hashedPassword, name });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
  await emailService.sendWelcome(user.email, user.name);
  await analytics.track('user_registered', { userId: user.id });
  await auditLog.record('registration', { userId: user.id, email: user.email });
  // ... imagine 30 more lines of notification setup, default preferences, etc.
  return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
}
```

**Why it fails**: This function handles input validation, duplicate checking, password hashing, user creation, JWT generation, cookie configuration, email sending, analytics, and audit logging. Each responsibility should be independently testable and nameable.

**After**:
```typescript
async function handleUserRegistration(req: Request, res: Response) {
  const registrationInput = validateRegistrationInput(req.body);
  if (!registrationInput.valid) {
    return res.status(400).json({ error: registrationInput.error });
  }

  const existingUser = await findUserByEmail(registrationInput.email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email address is already registered' });
  }

  const newUser = await createUserWithCredentials(registrationInput);
  const authToken = issueAuthToken(newUser);
  setAuthCookie(res, authToken);
  await dispatchRegistrationSideEffects(newUser);

  return res.status(201).json({ user: sanitiseUserForResponse(newUser) });
}
```

**Detection cue**: Count the lines between the function's opening brace and closing brace. If the count exceeds 50, the function needs decomposition.


## 9. Deeply nested conditionals

**Before**:
```typescript
function processOrder(order: Order, user: User) {
  if (order) {
    if (order.items.length > 0) {
      if (user) {
        if (user.verified) {
          if (order.total <= user.creditLimit) {
            // Actually process the order
            return submitOrder(order, user);
          } else {
            throw new Error('Credit limit exceeded');
          }
        } else {
          throw new Error('User not verified');
        }
      } else {
        throw new Error('User required');
      }
    } else {
      throw new Error('Order has no items');
    }
  } else {
    throw new Error('Order required');
  }
}
```

**Why it fails**: Five levels of nesting. The actual business logic (`submitOrder`) is buried at the deepest indentation level, surrounded by error handling. A reader must mentally track five boolean conditions to understand when the happy path executes.

**After**:
```typescript
function processOrder(order: Order, user: User): OrderConfirmation {
  if (!order) {
    throw new Error('Order is required');
  }
  if (order.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }
  if (!user) {
    throw new Error('User is required');
  }
  if (!user.verified) {
    throw new Error('User account must be verified before placing orders');
  }
  if (order.total > user.creditLimit) {
    throw new Error(`Order total ($${order.total}) exceeds credit limit ($${user.creditLimit})`);
  }

  return submitOrder(order, user);
}
```

**Detection cue**: Indentation depth exceeding three levels within a single function. The pyramid shape — code that drifts rightward — is the visual signal.


## 10. Magic numbers and strings

**Before**:
```typescript
if (retries > 3) {
  throw new Error('Failed');
}

setTimeout(callback, 30000);

if (user.role === 'admin' || user.role === 'super') {
  grantAccess();
}

const truncated = text.slice(0, 255);
```

**Why it fails**: `3`, `30000`, `'admin'`, `'super'`, and `255` appear without explanation. Is 3 retries a business rule or an arbitrary choice? Is 30000 milliseconds a timeout, and if so, why 30 seconds? Is 255 a database column width, a UI constraint, or something else?

**After**:
```typescript
const MAX_RETRY_ATTEMPTS = 3;
const AGENT_TIMEOUT_MS = 30_000;
const PRIVILEGED_ROLES = ['admin', 'super'] as const;
const MAX_DISPLAY_NAME_LENGTH = 255;

if (retryCount > MAX_RETRY_ATTEMPTS) {
  throw new Error(`Agent execution failed after ${MAX_RETRY_ATTEMPTS} attempts`);
}

setTimeout(handleAgentTimeout, AGENT_TIMEOUT_MS);

if (PRIVILEGED_ROLES.includes(user.role)) {
  grantAccess();
}

const truncatedDisplayName = displayName.slice(0, MAX_DISPLAY_NAME_LENGTH);
```

**Detection cue**: Numeric literals other than 0, 1, -1, or well-known values (100 for percentage, 1000 for seconds-to-milliseconds). String literals used in comparisons or conditions that represent domain concepts.


## 11. Inconsistent naming within a file

**Before**:
```typescript
const user_name = getUser().name;       // snake_case in TypeScript
const userEmail = getUser().email;       // camelCase
const UserAge = getUser().age;           // PascalCase for a variable
function get_active_users() { ... }      // snake_case function in TypeScript
function fetchInactiveUsers() { ... }    // camelCase function
```

**Why it fails**: Three naming conventions in one file. The reader cannot predict the name of any variable or function without looking it up. Inconsistency signals carelessness and makes automated refactoring tools less effective.

**After**:
```typescript
const userName = getUser().name;
const userEmail = getUser().email;
const userAge = getUser().age;
function getActiveUsers() { ... }
function fetchInactiveUsers() { ... }
```

**Detection cue**: Multiple naming conventions for the same category of identifier (variables, functions, constants) within a single file. In TypeScript, `snake_case` variables alongside `camelCase` variables. In Python, `camelCase` functions alongside `snake_case` functions.


## 12. Import-all patterns

**Before**:
```typescript
import * as utils from './utils';
import * as helpers from '../helpers';
import * as types from './types';

const formatted = utils.formatDate(date);
const validated = helpers.validateInput(input);
const user: types.User = getCurrentUser();
```

**Why it fails**: Wildcard imports pull the entire module into the bundle, defeating tree-shaking. They also obscure which specific utilities the file depends on — a reader cannot quickly determine the file's external dependencies without scanning every usage of the `utils` namespace.

**After**:
```typescript
import { formatDate } from './utils';
import { validateInput } from '../helpers';
import type { User } from './types';

const formattedDate = formatDate(date);
const validatedInput = validateInput(input);
const currentUser: User = getCurrentUser();
```

**Detection cue**: `import * as` statements outside of namespace imports required by the library's API design (rare — legitimate cases include Mongoose models and some testing libraries).
