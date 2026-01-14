# AI Agents SDK Architecture

> Based on [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) patterns

## Overview

The AI Project Scaffolding includes a powerful agent framework for building multi-agent workflows. This architecture follows patterns from the OpenAI Agents SDK, providing:

- **Agents**: LLMs configured with instructions, tools, guardrails, and handoffs
- **Tools**: Function tools with Zod schema validation
- **Context**: Dependency injection for services and state
- **Guardrails**: Input/output validation and safety checks
- **Handoffs**: Transfer control between specialized agents
- **Runner**: Execute agents with conversation management

## Quick Start

```typescript
import { Agent, tool, createRunner, createContext } from '@/lib/agents';
import { z } from 'zod';

// 1. Create a tool
const greetTool = tool({
  name: 'greet',
  description: 'Greet a user by name',
  parameters: z.object({
    name: z.string().describe('Name of person to greet'),
  }),
  execute: ({ name }) => `Hello, ${name}!`,
});

// 2. Create an agent
const agent = Agent.create({
  name: 'Greeter',
  instructions: 'You are a friendly assistant that greets users.',
  tools: [greetTool],
});

// 3. Set up runner with model provider
const runner = createRunner({
  modelProvider: yourModelProvider,
});

// 4. Create context
const ctx = createContext({ userId: 'user_123' });

// 5. Run the agent
const result = await runner.run(agent, 'Say hello to John', { context: ctx });
console.log(result.finalOutput); // Uses greet tool
```

## Core Concepts

### Agents

Agents are the primary building block. Each agent has:

- **name**: Unique identifier
- **instructions**: System prompt (can be dynamic based on context)
- **tools**: Available function tools
- **handoffs**: Agents to transfer control to
- **guardrails**: Input/output validation
- **outputType**: Optional Zod schema for structured output

```typescript
const agent = Agent.create({
  name: 'Assistant',
  instructions: 'You are a helpful assistant.',
  tools: [myTool],
  handoffs: [handoffToSpecialist],
  inputGuardrails: [promptInjectionGuardrail],
  outputGuardrails: [sensitiveDataGuardrail],
  maxTurns: 10,
  temperature: 0.7,
});
```

### Tools

Tools let agents take actions. Built with Zod for type-safe validation:

```typescript
import { z } from 'zod';

const searchTool = tool({
  name: 'search_database',
  description: 'Search the database for records',
  parameters: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(10).describe('Max results'),
    filters: z.record(z.string()).optional().describe('Filter criteria'),
  }),
  execute: async ({ query, limit, filters }, ctx) => {
    // Access context for services
    const db = ctx.context.services?.db;
    const results = await db.search(query, { limit, filters });
    return results;
  },
  errorFunction: (error, input) => `Search failed: ${error.message}`,
});
```

### Context

Context provides dependency injection:

```typescript
interface MyContext extends BaseContext {
  db: DatabaseClient;
  user: { id: string; name: string };
  features: Record<string, boolean>;
}

const ctx = createContext<MyContext>({
  userId: 'user_123',
  services: { db: databaseClient },
  features: { newFeature: true },
  initial: { user: { id: 'user_123', name: 'John' } },
});

// Use in tools
execute: async (input, ctx) => {
  const user = ctx.context.user;
  const db = ctx.context.services?.db;
  // ...
}
```

### Guardrails

Guardrails validate input and output:

```typescript
// Input guardrail
const maxLengthGuard = inputGuardrail({
  name: 'max_length',
  description: 'Limit input length',
  validate: (input) => {
    if (input.length > 10000) {
      return stopResult('Input too long');
    }
    return continueResult();
  },
});

// Output guardrail
const noSecretsGuard = outputGuardrail({
  name: 'no_secrets',
  description: 'Block sensitive data in output',
  validate: (output) => {
    if (output.includes('API_KEY')) {
      return stopResult('Output contains sensitive data');
    }
    return continueResult();
  },
});

// Built-in guardrails
import {
  promptInjectionGuardrail,
  sensitiveDataGuardrail,
  maxLengthGuardrail,
} from '@/lib/agents';
```

### Handoffs

Handoffs transfer control between agents:

```typescript
const supportAgent = Agent.create({
  name: 'Support',
  instructions: 'Handle support requests',
  handoffs: [
    handoff({
      targetAgent: technicalAgent,
      description: 'Technical issues and troubleshooting',
      filter: (input) => input.reason.includes('technical'),
    }),
    handoff({
      targetAgent: billingAgent,
      description: 'Billing and payment issues',
      filter: (input) => input.reason.includes('billing'),
    }),
  ],
});
```

## Multi-Agent Patterns

### Pattern 1: Manager (Agent as Tool)

A central agent orchestrates specialized agents:

```typescript
import { agentAsTool } from '@/lib/agents';

const manager = Agent.create({
  name: 'Manager',
  instructions: 'Coordinate specialists to handle complex requests.',
  tools: [
    agentAsTool(technicalAgent),
    agentAsTool(billingAgent),
    agentAsTool(salesAgent),
  ],
});
```

### Pattern 2: Router

Automatically route to the best agent:

```typescript
import { createRouter, keywordSelector } from '@/lib/agents';

const router = createRouter({
  agents: [technicalAgent, billingAgent, salesAgent],
  selector: keywordSelector({
    bug: technicalAgent,
    error: technicalAgent,
    refund: billingAgent,
    price: salesAgent,
  }),
  defaultAgent: triageAgent,
});

// Use router
const selectedAgent = await router.route(userInput, context);
const result = await runner.run(selectedAgent, userInput, { context });
```

### Pattern 3: Chain

Sequential agent execution:

```typescript
import { executeChain } from '@/lib/agents';

const result = await executeChain(
  {
    agents: [analyzeAgent, solutionAgent, reviewAgent],
    transform: (output, index) => `Previous: ${output}\n\nContinue:`,
    stopCondition: (output) => output.includes('DONE'),
  },
  input,
  context
);
```

### Pattern 4: Parallel

Concurrent agent execution:

```typescript
import { executeParallel } from '@/lib/agents';

const result = await executeParallel(
  {
    agents: [agent1, agent2, agent3],
    aggregate: (results) => {
      // Combine results from all agents
      return Array.from(results.values()).join('\n---\n');
    },
    timeout: 30000,
  },
  input,
  context
);
```

## Runner

The Runner executes agents:

```typescript
import { createRunner, createConversation } from '@/lib/agents';

// Basic run
const runner = createRunner({ modelProvider });
const result = await runner.run(agent, input, { context });

// Streaming
for await (const chunk of runner.runStream(agent, input, { context })) {
  if (chunk.type === 'chunk') {
    process.stdout.write(chunk.content);
  }
}

// Conversation (multi-turn)
const conversation = createConversation(runner, agent, { context });
const response1 = await conversation.send('Hello');
const response2 = await conversation.send('Tell me more');
console.log(conversation.getHistory());

// Batch processing
const results = await runBatch(runner, agent, inputs, {
  concurrency: 5,
  contextFactory: (input, index) => createContext({ index }),
  onResult: (input, result) => console.log(`Done: ${input}`),
});
```

## Australian Locale Support

Built-in support for Australian context:

```typescript
import { createAustralianContext } from '@/lib/agents';

const ctx = createAustralianContext({
  state: 'QLD',
  // Automatically sets:
  // - timezone: 'Australia/Brisbane'
  // - dateFormat: 'DD/MM/YYYY'
  // - currency: 'AUD'
  // - gstRate: 0.1
});
```

## File Structure

```
apps/web/lib/agents/
├── core/
│   ├── types.ts          # TypeScript types
│   ├── agent.ts          # Agent class and builder
│   ├── tool.ts           # Tool factory and registry
│   ├── context.ts        # Context management
│   ├── guardrail.ts      # Input/output guardrails
│   ├── handoff.ts        # Multi-agent handoffs
│   ├── runner.ts         # Agent execution
│   └── index.ts          # Public exports
├── examples/
│   ├── contractor-agent.ts  # Australian locale example
│   ├── multi-agent.ts       # Orchestration patterns
│   └── index.ts
└── index.ts              # Main exports
```

## Integration with Existing Tools

The agent framework integrates with the existing tool client:

```typescript
import { AdvancedToolClient } from '@/lib/tools';
import { tool, createToolRegistry } from '@/lib/agents';

// Convert existing tools
const registry = createToolRegistry();
registry.register(myTool);

// Use with agent
const agent = Agent.create({
  name: 'Assistant',
  instructions: '...',
  tools: registry.getAll(),
});
```

## Best Practices

1. **Short, explicit tool descriptions** - Describe what the tool does and when to use it
2. **Validate inputs** - Use Zod schemas for strict validation
3. **One responsibility per tool** - Small, composable tools lead to better reasoning
4. **Use context for services** - Inject database connections, APIs, etc. via context
5. **Add guardrails** - Validate both input and output for safety
6. **Handle errors gracefully** - Provide `errorFunction` for custom error messages

## Resources

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-js/)
- [OpenAI Agents SDK GitHub](https://github.com/openai/openai-agents-js)
- [Zod Documentation](https://zod.dev/)
