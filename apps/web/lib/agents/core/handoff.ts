/**
 * Handoff System for Multi-Agent Orchestration
 *
 * Handoffs enable agents to transfer control to other specialized agents.
 * This is a key pattern for building complex multi-agent workflows.
 *
 * Based on OpenAI Agents SDK patterns:
 * - https://openai.github.io/openai-agents-js/guides/multi-agent/
 */

import type { AgentLike, Handoff, HandoffInput, Tool, ToolExecuteContext } from "./types";
import type { BaseContext } from "./context";
import { z } from "zod";

// ============================================================================
// Handoff Factory
// ============================================================================

export interface HandoffOptions<TContext = unknown> {
  /** Target agent to hand off to */
  targetAgent: AgentLike<TContext>;
  /** Description of when to use this handoff */
  description: string;
  /** Filter function to determine if handoff applies */
  filter?: (input: HandoffInput, ctx: TContext) => boolean | Promise<boolean>;
  /** Transform context before handoff */
  transformContext?: (ctx: TContext, input: HandoffInput) => TContext;
}

/**
 * Create a handoff configuration
 *
 * @example
 * ```typescript
 * const toSupportAgent = handoff({
 *   targetAgent: supportAgent,
 *   description: "Hand off to support agent for customer issues",
 *   filter: (input) => input.reason.includes("support") || input.reason.includes("help"),
 * });
 * ```
 */
export function handoff<TContext = unknown>(
  options: HandoffOptions<TContext>
): Handoff<TContext> {
  return {
    targetAgent: options.targetAgent,
    description: options.description,
    filter: options.filter,
    transformContext: options.transformContext,
  };
}

// ============================================================================
// Handoff Tool Generation
// ============================================================================

/**
 * Generate a tool for executing a handoff
 *
 * This creates a special tool that the agent can call to transfer control
 * to another agent.
 */
export function handoffToTool<TContext>(
  h: Handoff<TContext>,
  onHandoff: (targetAgent: AgentLike<TContext>, reason: string, ctx: TContext) => void
): Tool<z.ZodType, unknown, TContext> {
  const schema = z.object({
    reason: z.string().describe("Reason for handing off to this agent"),
    context: z
      .record(z.unknown())
      .optional()
      .describe("Additional context to pass to the target agent"),
  });

  return {
    name: `handoff_to_${h.targetAgent.name.toLowerCase().replace(/\s+/g, "_")}`,
    description: `Hand off to ${h.targetAgent.name}: ${h.description}`,
    parameters: schema,
    execute: async (input: z.infer<typeof schema>, ctx: ToolExecuteContext<TContext>) => {
      const handoffInput: HandoffInput = {
        reason: input.reason,
        context: input.context,
      };

      // Check filter if provided
      if (h.filter) {
        const shouldHandoff = await h.filter(handoffInput, ctx.context);
        if (!shouldHandoff) {
          return {
            success: false,
            message: "Handoff filter rejected the request",
          };
        }
      }

      // Transform context if needed
      const transformedContext = h.transformContext
        ? h.transformContext(ctx.context, handoffInput)
        : ctx.context;

      // Execute handoff callback
      onHandoff(h.targetAgent, input.reason, transformedContext);

      return {
        success: true,
        message: `Handing off to ${h.targetAgent.name}`,
        targetAgent: h.targetAgent.name,
        reason: input.reason,
      };
    },
  };
}

/**
 * Generate handoff tools for all handoffs
 */
export function handoffsToTools<TContext>(
  handoffs: Handoff<TContext>[],
  onHandoff: (targetAgent: AgentLike<TContext>, reason: string, ctx: TContext) => void
): Tool<z.ZodType, unknown, TContext>[] {
  return handoffs.map((h) => handoffToTool(h, onHandoff));
}

// ============================================================================
// Handoff Patterns
// ============================================================================

/**
 * Create a router that selects which agent to hand off to based on input
 */
export interface RouterConfig<TContext> {
  /** Available agents to route to */
  agents: AgentLike<TContext>[];
  /** Function to select the best agent */
  selector: (
    input: string,
    agents: AgentLike<TContext>[],
    ctx: TContext
  ) => AgentLike<TContext> | null | Promise<AgentLike<TContext> | null>;
  /** Default agent if selector returns null */
  defaultAgent?: AgentLike<TContext>;
}

/**
 * Create a router handoff that dynamically selects target agent
 */
export function createRouter<TContext>(
  config: RouterConfig<TContext>
): {
  route: (input: string, ctx: TContext) => Promise<AgentLike<TContext> | null>;
  agents: AgentLike<TContext>[];
} {
  return {
    route: async (input: string, ctx: TContext) => {
      const selected = await config.selector(input, config.agents, ctx);
      return selected || config.defaultAgent || null;
    },
    agents: config.agents,
  };
}

/**
 * Keyword-based router selector
 */
export function keywordSelector<TContext>(
  keywordMap: Record<string, AgentLike<TContext>>
): RouterConfig<TContext>["selector"] {
  return (input) => {
    const lowerInput = input.toLowerCase();
    for (const [keyword, agent] of Object.entries(keywordMap)) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        return agent;
      }
    }
    return null;
  };
}

/**
 * Pattern-based router selector
 */
export function patternSelector<TContext>(
  patternMap: Array<{ pattern: RegExp; agent: AgentLike<TContext> }>
): RouterConfig<TContext>["selector"] {
  return (input) => {
    for (const { pattern, agent } of patternMap) {
      if (pattern.test(input)) {
        return agent;
      }
    }
    return null;
  };
}

// ============================================================================
// Handoff Chain
// ============================================================================

/**
 * Create a chain of agents that process sequentially
 */
export interface ChainConfig<TContext, TOutput> {
  /** Agents in the chain (processed in order) */
  agents: AgentLike<TContext>[];
  /** Transform output between agents */
  transform?: (output: TOutput, agentIndex: number, ctx: TContext) => string;
  /** Stop condition (return true to stop early) */
  stopCondition?: (output: TOutput, agentIndex: number, ctx: TContext) => boolean;
}

/**
 * Execute a chain of agents
 */
export async function executeChain<TContext, TOutput = string>(
  config: ChainConfig<TContext, TOutput>,
  initialInput: string,
  ctx: TContext
): Promise<{
  outputs: TOutput[];
  finalOutput: TOutput;
  agentsExecuted: string[];
}> {
  const outputs: TOutput[] = [];
  const agentsExecuted: string[] = [];
  let currentInput = initialInput;

  for (let i = 0; i < config.agents.length; i++) {
    const agent = config.agents[i];
    agentsExecuted.push(agent.name);

    const result = await agent.run(currentInput, ctx);
    outputs.push(result.finalOutput as TOutput);

    // Check stop condition
    if (config.stopCondition?.(result.finalOutput as TOutput, i, ctx)) {
      break;
    }

    // Transform for next agent
    if (i < config.agents.length - 1) {
      currentInput = config.transform
        ? config.transform(result.finalOutput as TOutput, i, ctx)
        : String(result.finalOutput);
    }
  }

  return {
    outputs,
    finalOutput: outputs[outputs.length - 1],
    agentsExecuted,
  };
}

// ============================================================================
// Parallel Execution
// ============================================================================

/**
 * Execute multiple agents in parallel and aggregate results
 */
export interface ParallelConfig<TContext, TOutput> {
  /** Agents to run in parallel */
  agents: AgentLike<TContext>[];
  /** Aggregate the results */
  aggregate: (results: Map<string, TOutput>, ctx: TContext) => TOutput;
  /** Timeout for each agent (ms) */
  timeout?: number;
}

/**
 * Execute agents in parallel
 */
export async function executeParallel<TContext, TOutput = string>(
  config: ParallelConfig<TContext, TOutput>,
  input: string,
  ctx: TContext
): Promise<{
  results: Map<string, TOutput>;
  aggregatedOutput: TOutput;
  errors: Map<string, Error>;
  duration_ms: number;
}> {
  const startTime = Date.now();
  const results = new Map<string, TOutput>();
  const errors = new Map<string, Error>();

  // Create promises with optional timeout
  const promises = config.agents.map(async (agent) => {
    try {
      const result = await Promise.race([
        agent.run(input, ctx),
        config.timeout
          ? new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), config.timeout)
            )
          : new Promise<never>(() => {}), // Never resolves if no timeout
      ]);
      return { agent: agent.name, output: result.finalOutput as TOutput };
    } catch (error) {
      return { agent: agent.name, error: error as Error };
    }
  });

  // Wait for all to complete
  const settled = await Promise.all(promises);

  // Process results
  for (const result of settled) {
    if ("error" in result && result.error) {
      errors.set(result.agent, result.error);
    } else if ("output" in result) {
      results.set(result.agent, result.output);
    }
  }

  // Aggregate
  const aggregatedOutput = config.aggregate(results, ctx);

  return {
    results,
    aggregatedOutput,
    errors,
    duration_ms: Date.now() - startTime,
  };
}

// ============================================================================
// Manager Pattern (Agent as Tool)
// ============================================================================

/**
 * Wrap an agent as a tool for the manager pattern
 *
 * In this pattern, a central "manager" agent orchestrates specialized
 * agents by calling them as tools.
 */
export function agentAsTool<TContext>(
  agent: AgentLike<TContext>,
  inputSchema?: z.ZodType
): Tool<z.ZodType, unknown, TContext> {
  const schema = inputSchema || z.object({
    input: z.string().describe("Input to send to the agent"),
    context: z
      .record(z.unknown())
      .optional()
      .describe("Additional context for the agent"),
  });

  return {
    name: `call_${agent.name.toLowerCase().replace(/\s+/g, "_")}`,
    description: `Call the ${agent.name} agent: ${agent.config.instructions?.toString().slice(0, 100) || "A specialized agent"}...`,
    parameters: schema,
    execute: async (rawInput: unknown, ctx: ToolExecuteContext<TContext>) => {
      // Handle both string input and object input
      const input = typeof rawInput === "string"
        ? rawInput
        : (rawInput as { input?: string }).input || JSON.stringify(rawInput);

      const result = await agent.run(input, ctx.context);
      return {
        agentName: agent.name,
        output: result.finalOutput,
        turns: result.turns.length,
        toolCalls: result.toolCallCount,
      };
    },
  };
}

/**
 * Create tools for multiple agents (manager pattern)
 */
export function agentsAsTools<TContext>(
  agents: AgentLike<TContext>[]
): Tool<z.ZodType, unknown, TContext>[] {
  return agents.map((agent) => agentAsTool(agent));
}
