# Before/after examples

Three side-by-side comparisons demonstrating the most impactful code quality corrections. Each example shows the same functionality expressed first in default LLM style, then in the uplifted style.


## Example 1: Generic naming transformed to domain-specific naming

### Before

```typescript
async function getData(id: string) {
  const response = await fetch(`/api/agents/${id}/status`);
  if (!response.ok) {
    throw new Error('Failed to get data');
  }
  const data = await response.json();

  const result = data.entries.map((item: any) => {
    const val = item.score * 100;
    return {
      name: item.name,
      value: val,
      status: item.active ? 'active' : 'inactive',
    };
  });

  return result;
}

// Usage
const data = await getData('abc-123');
console.log('Got data:', data);
```

### Why the before version fails

Seven generic variable names (`data`, `response`, `result`, `item`, `val`, `id`, and `data` again at the call site) force the reader to trace each variable's origin to understand its content. The function name `getData` communicates nothing about what kind of data or from which domain. The `any` type on the map callback disables type checking for the most important transformation in the function. `console.log` at the call site will leak agent performance data to stdout in production.

The error message "Failed to get data" tells the user nothing about what went wrong or how to recover. The magic number `100` appears without explanation — is it converting a decimal to a percentage, normalising a score, or something else?

### After

```typescript
interface AgentPerformanceMetric {
  metricName: string;
  percentageScore: number;
  operationalStatus: 'active' | 'inactive';
}

interface AgentStatusPayload {
  entries: Array<{
    name: string;
    score: number;
    active: boolean;
  }>;
}

const PERCENTAGE_MULTIPLIER = 100;

async function fetchAgentPerformanceMetrics(agentId: string): Promise<AgentPerformanceMetric[]> {
  const httpResponse = await fetch(`/api/agents/${agentId}/status`);
  if (!httpResponse.ok) {
    throw new Error(
      `Failed to fetch performance metrics for agent '${agentId}': ${httpResponse.status} ${httpResponse.statusText}`
    );
  }
  const agentStatusPayload: AgentStatusPayload = await httpResponse.json();

  return agentStatusPayload.entries.map((metricEntry) => ({
    metricName: metricEntry.name,
    percentageScore: metricEntry.score * PERCENTAGE_MULTIPLIER,
    operationalStatus: metricEntry.active ? 'active' : 'inactive',
  }));
}

// Usage
const agentMetrics = await fetchAgentPerformanceMetrics('abc-123');
logger.info('Agent performance metrics retrieved', { agentId: 'abc-123', metricCount: agentMetrics.length });
```

### What changed

Every variable name now describes its domain content. `fetchAgentPerformanceMetrics` tells the reader exactly what the function returns and from which domain. The `any` type is replaced with explicit interfaces. The magic number `100` is a named constant. The error message includes the agent ID and HTTP status for debugging. `console.log` is replaced with structured logging that provides queryable context without leaking raw data.


## Example 2: Over-commented code with console.log transformed to clean code with structured logging

### Before

```python
def process_request(data):
    """Process the request."""
    # Log the start
    print(f"Starting to process request: {data}")

    # Get the user
    user = get_user(data["user_id"])

    # Check if user exists
    if user is None:
        # Log the error
        print(f"User not found: {data['user_id']}")
        # Return error
        return {"error": "not found"}

    # Get the items
    items = get_items(user.id)

    # Filter active items
    active = [i for i in items if i.active]

    # Calculate the total
    total = 0
    for item in active:
        # Add the price
        total += item.price
        # Log each item
        print(f"Added item: {item.name}, price: {item.price}")

    # Log the result
    print(f"Total: {total}")

    # Return the result
    return {"total": total, "count": len(active)}
```

### Why the before version fails

Fourteen comments, and none of them explain anything the code does not already say. "Get the user" above `get_user()`, "Check if user exists" above `if user is None`, "Calculate the total" above `total = 0` — every comment is a WHAT comment that restates the line below it. The function has no type hints, uses `data` and `items` as generic names, and `print` statements scatter unstructured output throughout. The docstring "Process the request" restates the function name.

The single-letter variable `i` in the list comprehension is acceptable for a short expression, but `active` is ambiguous — active what? The error response `{"error": "not found"}` has no structure and no HTTP status context.

### After

```python
import structlog

from src.models.order import OrderItem, OrderSummary
from src.models.user import User
from src.exceptions import UserNotFoundError

logger = structlog.get_logger(__name__)

MINIMUM_ORDER_TOTAL = 0


def calculate_active_order_summary(
    user_id: str,
) -> OrderSummary:
    """Calculate the total value of a user's active order items.

    Retrieves the user and their associated order items, filters to
    active items only, and returns an aggregate summary. Raises
    UserNotFoundError if the user does not exist.
    """
    logger.info("order_summary_calculation_started", user_id=user_id)

    user = get_user(user_id)
    if user is None:
        raise UserNotFoundError(f"User '{user_id}' does not exist")

    order_items = get_order_items(user.id)
    active_order_items = [
        order_item for order_item in order_items if order_item.active
    ]

    order_total = sum(order_item.price for order_item in active_order_items)

    logger.info(
        "order_summary_calculation_completed",
        user_id=user_id,
        active_item_count=len(active_order_items),
        order_total=order_total,
    )

    return OrderSummary(
        total=order_total,
        active_item_count=len(active_order_items),
    )
```

### What changed

All fourteen WHAT comments are deleted. The function name `calculate_active_order_summary` documents what it does. The docstring explains the business logic and the error contract — information the code alone does not convey. Generic names (`data`, `items`, `active`, `i`) become domain-specific (`user_id`, `order_items`, `active_order_items`, `order_item`). Six `print` statements become two structured log calls at meaningful boundaries (start and completion). Type hints document the function's contract. The error is a typed exception rather than a dict with a string.


## Example 3: any-heavy nested code transformed to typed code with early returns

### Before

```typescript
async function handleRequest(req: any, res: any) {
  try {
    if (req.body) {
      if (req.body.type === 'agent') {
        if (req.body.action === 'execute') {
          const data: any = req.body.payload;
          if (data) {
            if (data.prompt) {
              if (data.prompt.length > 0) {
                const result: any = await executeAgent(data);
                if (result) {
                  if (result.success) {
                    res.json({ data: result.output });
                  } else {
                    res.status(500).json({ error: 'Failed' });
                  }
                } else {
                  res.status(500).json({ error: 'No result' });
                }
              } else {
                res.status(400).json({ error: 'Empty prompt' });
              }
            } else {
              res.status(400).json({ error: 'Missing prompt' });
            }
          } else {
            res.status(400).json({ error: 'Missing payload' });
          }
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
      } else {
        res.status(400).json({ error: 'Invalid type' });
      }
    } else {
      res.status(400).json({ error: 'Missing body' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong' });
  }
}
```

### Why the before version fails

Eight levels of nesting. The actual business logic (`executeAgent`) is buried at indentation level 8, surrounded by validation checks that grow rightward like a pyramid. Every variable is typed as `any`, so the compiler cannot catch any structural mistakes. The error messages are vague ("Failed", "Something went wrong") and provide no context for debugging. The catch block swallows the original error, making production debugging impossible.

A reader trying to understand the happy path must mentally filter out seven layers of conditional checks. A reader trying to understand the error handling must trace each `else` branch back to its corresponding `if` to determine which condition failed.

### After

```typescript
import { type Request, type Response } from 'express';
import { logger } from '../lib/logger';

interface AgentExecutionPayload {
  prompt: string;
  modelId?: string;
  temperature?: number;
}

interface AgentExecutionRequest {
  type: 'agent';
  action: 'execute';
  payload: AgentExecutionPayload;
}

function isAgentExecutionRequest(body: unknown): body is AgentExecutionRequest {
  if (typeof body !== 'object' || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    candidate.type === 'agent' &&
    candidate.action === 'execute' &&
    typeof candidate.payload === 'object' &&
    candidate.payload !== null &&
    typeof (candidate.payload as Record<string, unknown>).prompt === 'string'
  );
}

async function handleAgentExecution(req: Request, res: Response): Promise<void> {
  if (!isAgentExecutionRequest(req.body)) {
    res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request must include type "agent", action "execute", and a payload with a non-empty prompt',
      },
    });
    return;
  }

  const { prompt, modelId, temperature } = req.body.payload;
  if (prompt.trim().length === 0) {
    res.status(400).json({
      error: {
        code: 'EMPTY_PROMPT',
        message: 'The prompt must contain at least one non-whitespace character',
      },
    });
    return;
  }

  try {
    const executionResult = await executeAgent({
      prompt,
      modelId,
      temperature,
    });

    if (!executionResult.success) {
      logger.warn('Agent execution returned failure', {
        prompt: prompt.slice(0, 100),
        errorCode: executionResult.errorCode,
      });
      res.status(502).json({
        error: {
          code: 'AGENT_EXECUTION_FAILED',
          message: `Agent execution failed: ${executionResult.errorMessage}`,
        },
      });
      return;
    }

    res.json({ agentOutput: executionResult.output });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Agent execution threw an exception', {
      prompt: prompt.slice(0, 100),
      error: errorMessage,
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Agent execution encountered an internal error. Check server logs for details.',
      },
    });
  }
}
```

### What changed

Eight nesting levels reduced to two (the try/catch and one conditional). Validation is handled by a type guard function (`isAgentExecutionRequest`) that narrows `unknown` to the specific request shape — the compiler enforces correctness from that point onward. Guard clauses with early returns handle each invalid case at the top level, so the happy path runs at minimal indentation.

All `any` types are eliminated. The request body is `unknown` until the type guard narrows it. The error responses use structured JSON with machine-readable codes and descriptive messages. The catch block logs the original error with context and returns a safe message to the client. The function name `handleAgentExecution` describes the specific domain action rather than the generic `handleRequest`.
