/**
 * Agent Class
 *
 * The core Agent class based on OpenAI Agents SDK patterns.
 * Agents are LLMs configured with instructions, tools, guardrails, and handoffs.
 *
 * Features:
 * - Generic context type for dependency injection
 * - Tool execution with validation
 * - Handoffs to other agents
 * - Input/output guardrails
 * - Structured output support
 */

import type { z } from "zod";
import type {
  AgentConfig,
  AgentLike,
  Tool,
  Handoff,
  InputGuardrail,
  OutputGuardrail,
  RunResult,
  Message,
  Turn,
  ToolCall,
  ToolResult,
  ModelProvider,
  EventHandler,
  AgentEvent,
} from "./types";
import type { BaseContext } from "./context";
import { toolsToModelFormat, executeTool } from "./tool";
import { handoffsToTools } from "./handoff";
import { runGuardrails } from "./guardrail";

// ============================================================================
// Agent Class
// ============================================================================

export class Agent<TContext = unknown, TOutput = string>
  implements AgentLike<TContext, TOutput>
{
  readonly name: string;
  readonly config: AgentConfig<TContext, TOutput>;

  private modelProvider?: ModelProvider;
  private eventHandlers: EventHandler[] = [];
  private pendingHandoff: {
    targetAgent: AgentLike<TContext>;
    reason: string;
    context: TContext;
  } | null = null;

  constructor(config: AgentConfig<TContext, TOutput>) {
    this.name = config.name;
    this.config = config;
  }

  /**
   * Create an agent (factory method)
   */
  static create<TContext = unknown, TOutput = string>(
    config: AgentConfig<TContext, TOutput>
  ): Agent<TContext, TOutput> {
    return new Agent(config);
  }

  /**
   * Set the model provider for this agent
   */
  setModelProvider(provider: ModelProvider): this {
    this.modelProvider = provider;
    return this;
  }

  /**
   * Add an event handler
   */
  onEvent(handler: EventHandler): this {
    this.eventHandlers.push(handler);
    return this;
  }

  /**
   * Emit an event to all handlers
   */
  private emit(event: AgentEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch {
        // Ignore handler errors
      }
    }
  }

  /**
   * Get the system instructions for this agent
   */
  async getInstructions(ctx: TContext): Promise<string> {
    if (typeof this.config.instructions === "function") {
      return await this.config.instructions(ctx);
    }
    return this.config.instructions;
  }

  /**
   * Get all tools including handoff tools
   */
  private getAllTools(ctx: TContext): Tool<z.ZodType, unknown, TContext>[] {
    const tools: Tool<z.ZodType, unknown, TContext>[] = [
      ...(this.config.tools || []),
    ];

    // Add handoff tools
    if (this.config.handoffs && this.config.handoffs.length > 0) {
      const handoffTools = handoffsToTools(
        this.config.handoffs,
        (targetAgent, reason, newCtx) => {
          this.pendingHandoff = { targetAgent, reason, context: newCtx };
        }
      );
      tools.push(...handoffTools);
    }

    return tools;
  }

  /**
   * Run the agent with input
   */
  async run(input: string, ctx: TContext): Promise<RunResult<TOutput>> {
    const startTime = Date.now();
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    this.emit({ type: "run_start", runId, agentName: this.name, input });

    // Initialize messages
    const messages: Message[] = [];
    const turns: Turn[] = [];
    let toolCallCount = 0;
    let hadHandoff = false;
    let currentAgent: AgentLike<TContext, TOutput> = this;
    let currentCtx = ctx;

    // Add system message
    const instructions = await this.getInstructions(currentCtx);
    messages.push({ role: "system", content: instructions });

    // Run input guardrails
    if (this.config.inputGuardrails && this.config.inputGuardrails.length > 0) {
      const guardrailResult = await runGuardrails(
        this.config.inputGuardrails,
        input,
        currentCtx
      );

      if (!guardrailResult.passed) {
        this.emit({
          type: "guardrail_triggered",
          runId,
          guardrailName: guardrailResult.failedGuardrail || "unknown",
          result: guardrailResult.results[0]?.result || { action: "stop" },
        });

        // Return early with guardrail error
        return {
          finalOutput: (guardrailResult.message || "Input validation failed") as TOutput,
          isStructured: false,
          messages,
          turns: [],
          totalDuration_ms: Date.now() - startTime,
          finalAgent: this.name,
          toolCallCount: 0,
          hadHandoff: false,
          runId,
        };
      }
    }

    // Add user message
    messages.push({ role: "user", content: input });

    // Agent loop
    const maxTurns = this.config.maxTurns || 10;
    let turnIndex = 0;

    while (turnIndex < maxTurns) {
      this.emit({ type: "turn_start", runId, turnIndex });
      const turnStart = Date.now();

      // Check for pending handoff
      if (this.pendingHandoff) {
        hadHandoff = true;
        const { targetAgent, reason, context: newCtx } = this.pendingHandoff;

        this.emit({
          type: "handoff",
          runId,
          from: currentAgent.name,
          to: targetAgent.name,
          reason,
        });

        // Execute handoff
        currentAgent = targetAgent as AgentLike<TContext, TOutput>;
        currentCtx = newCtx;
        this.pendingHandoff = null;

        // Update system message for new agent
        const newInstructions = await (currentAgent as Agent<TContext, TOutput>).getInstructions(currentCtx);
        messages[0] = { role: "system", content: newInstructions };

        continue;
      }

      // Get model response
      if (!this.modelProvider) {
        throw new Error("Model provider not set. Call setModelProvider() first.");
      }

      const tools = this.getAllTools(currentCtx);
      const modelTools = tools.length > 0 ? toolsToModelFormat(tools) : undefined;

      this.emit({ type: "model_call", runId, model: this.config.model || "default", messages });

      const response = await this.modelProvider.chat(messages, {
        model: this.config.model,
        temperature: this.config.temperature,
        tools: modelTools,
        responseFormat: this.config.outputType
          ? { type: "json_object" }
          : undefined,
      });

      this.emit({ type: "model_response", runId, response });

      // Create turn record
      const turn: Turn = {
        index: turnIndex,
        agentName: currentAgent.name,
        input: messages[messages.length - 1].content,
        output: response.content || undefined,
        toolCalls: response.toolCalls,
        toolResults: [],
        duration_ms: 0,
      };

      // Handle tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Add assistant message with tool calls
        messages.push({
          role: "assistant",
          content: response.content || "",
          tool_calls: response.toolCalls,
        });

        // Execute each tool
        for (const toolCall of response.toolCalls) {
          toolCallCount++;
          const toolName = toolCall.function.name;
          const tool = tools.find((t) => t.name === toolName);

          if (!tool) {
            // Tool not found
            const errorResult: ToolResult = {
              tool_call_id: toolCall.id,
              output: "",
              error: `Tool "${toolName}" not found`,
            };
            turn.toolResults?.push(errorResult);
            messages.push({
              role: "tool",
              content: errorResult.error || "",
              tool_call_id: toolCall.id,
            });
            continue;
          }

          // Parse arguments
          let args: unknown;
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {
            args = {};
          }

          this.emit({ type: "tool_start", runId, toolName, input: args });

          // Execute tool
          const result = await executeTool({
            tool,
            input: args,
            context: currentCtx,
            agentName: currentAgent.name,
            runId,
          });

          if (result.success) {
            this.emit({ type: "tool_end", runId, toolName, output: result.output });

            const toolResult: ToolResult = {
              tool_call_id: toolCall.id,
              output: typeof result.output === "string"
                ? result.output
                : JSON.stringify(result.output),
            };
            turn.toolResults?.push(toolResult);
            messages.push({
              role: "tool",
              content: toolResult.output,
              tool_call_id: toolCall.id,
            });
          } else {
            this.emit({
              type: "tool_error",
              runId,
              toolName,
              error: new Error(result.error),
            });

            const toolResult: ToolResult = {
              tool_call_id: toolCall.id,
              output: "",
              error: result.error,
            };
            turn.toolResults?.push(toolResult);
            messages.push({
              role: "tool",
              content: result.error,
              tool_call_id: toolCall.id,
            });
          }
        }

        turn.duration_ms = Date.now() - turnStart;
        turns.push(turn);
        this.emit({ type: "turn_end", runId, turn });
        turnIndex++;
        continue;
      }

      // No tool calls - this is the final output
      const output = response.content || "";

      // Run output guardrails
      if (this.config.outputGuardrails && this.config.outputGuardrails.length > 0) {
        const guardrailResult = await runGuardrails(
          this.config.outputGuardrails,
          output,
          currentCtx
        );

        if (!guardrailResult.passed) {
          this.emit({
            type: "guardrail_triggered",
            runId,
            guardrailName: guardrailResult.failedGuardrail || "unknown",
            result: guardrailResult.results[0]?.result || { action: "stop" },
          });

          // Continue loop to get a new response
          messages.push({
            role: "user",
            content: `Your previous response was rejected: ${guardrailResult.message}. Please try again.`,
          });
          turnIndex++;
          continue;
        }
      }

      // Add assistant message
      messages.push({ role: "assistant", content: output });

      turn.output = output;
      turn.duration_ms = Date.now() - turnStart;
      turns.push(turn);
      this.emit({ type: "turn_end", runId, turn });

      // Parse structured output if needed
      let finalOutput: TOutput;
      let isStructured = false;

      if (this.config.outputType) {
        try {
          const parsed = JSON.parse(output);
          finalOutput = this.config.outputType.parse(parsed) as TOutput;
          isStructured = true;
        } catch {
          finalOutput = output as TOutput;
        }
      } else {
        finalOutput = output as TOutput;
      }

      const result: RunResult<TOutput> = {
        finalOutput,
        isStructured,
        messages,
        turns,
        totalDuration_ms: Date.now() - startTime,
        finalAgent: currentAgent.name,
        toolCallCount,
        hadHandoff,
        runId,
      };

      this.emit({ type: "run_end", runId, result: result as RunResult<unknown> });

      return result;
    }

    // Max turns reached
    return {
      finalOutput: "Maximum turns reached without final output" as TOutput,
      isStructured: false,
      messages,
      turns,
      totalDuration_ms: Date.now() - startTime,
      finalAgent: currentAgent.name,
      toolCallCount,
      hadHandoff,
      runId,
    };
  }

  /**
   * Clone this agent with modifications
   */
  clone(overrides: Partial<AgentConfig<TContext, TOutput>>): Agent<TContext, TOutput> {
    return new Agent({
      ...this.config,
      ...overrides,
    });
  }

  /**
   * Add tools to this agent (returns new agent)
   */
  withTools(tools: Tool<z.ZodType, unknown, TContext>[]): Agent<TContext, TOutput> {
    return this.clone({
      tools: [...(this.config.tools || []), ...tools],
    });
  }

  /**
   * Add handoffs to this agent (returns new agent)
   */
  withHandoffs(handoffs: Handoff<TContext>[]): Agent<TContext, TOutput> {
    return this.clone({
      handoffs: [...(this.config.handoffs || []), ...handoffs],
    });
  }

  /**
   * Add guardrails to this agent (returns new agent)
   */
  withGuardrails(
    inputGuardrails?: InputGuardrail<TContext>[],
    outputGuardrails?: OutputGuardrail<TContext>[]
  ): Agent<TContext, TOutput> {
    return this.clone({
      inputGuardrails: inputGuardrails
        ? [...(this.config.inputGuardrails || []), ...inputGuardrails]
        : this.config.inputGuardrails,
      outputGuardrails: outputGuardrails
        ? [...(this.config.outputGuardrails || []), ...outputGuardrails]
        : this.config.outputGuardrails,
    });
  }
}

// ============================================================================
// Agent Factory Functions
// ============================================================================

/**
 * Create an agent with the given configuration
 */
export function createAgent<TContext = unknown, TOutput = string>(
  config: AgentConfig<TContext, TOutput>
): Agent<TContext, TOutput> {
  return Agent.create(config);
}

/**
 * Create a simple agent with just name and instructions
 */
export function simpleAgent<TContext = unknown>(
  name: string,
  instructions: string
): Agent<TContext, string> {
  return createAgent({ name, instructions });
}

/**
 * Create an agent with tools
 */
export function toolAgent<TContext = unknown>(
  name: string,
  instructions: string,
  tools: Tool<z.ZodType, unknown, TContext>[]
): Agent<TContext, string> {
  return createAgent({ name, instructions, tools });
}

// ============================================================================
// Agent Builder
// ============================================================================

export class AgentBuilder<TContext = unknown, TOutput = string> {
  private config: Partial<AgentConfig<TContext, TOutput>> = {};

  /**
   * Set the agent name
   */
  name(name: string): this {
    this.config.name = name;
    return this;
  }

  /**
   * Set the instructions
   */
  instructions(
    instructions: string | ((ctx: TContext) => string | Promise<string>)
  ): this {
    this.config.instructions = instructions;
    return this;
  }

  /**
   * Set the model
   */
  model(model: string): this {
    this.config.model = model;
    return this;
  }

  /**
   * Add tools
   */
  tools(tools: Tool<z.ZodType, unknown, TContext>[]): this {
    this.config.tools = [...(this.config.tools || []), ...tools];
    return this;
  }

  /**
   * Add a single tool
   */
  tool(tool: Tool<z.ZodType, unknown, TContext>): this {
    this.config.tools = [...(this.config.tools || []), tool];
    return this;
  }

  /**
   * Add handoffs
   */
  handoffs(handoffs: Handoff<TContext>[]): this {
    this.config.handoffs = [...(this.config.handoffs || []), ...handoffs];
    return this;
  }

  /**
   * Add a single handoff
   */
  handoff(handoff: Handoff<TContext>): this {
    this.config.handoffs = [...(this.config.handoffs || []), handoff];
    return this;
  }

  /**
   * Add input guardrails
   */
  inputGuardrails(guardrails: InputGuardrail<TContext>[]): this {
    this.config.inputGuardrails = [
      ...(this.config.inputGuardrails || []),
      ...guardrails,
    ];
    return this;
  }

  /**
   * Add output guardrails
   */
  outputGuardrails(guardrails: OutputGuardrail<TContext>[]): this {
    this.config.outputGuardrails = [
      ...(this.config.outputGuardrails || []),
      ...guardrails,
    ];
    return this;
  }

  /**
   * Set structured output type
   */
  outputType(schema: z.ZodType<TOutput>): this {
    this.config.outputType = schema;
    return this;
  }

  /**
   * Set max turns
   */
  maxTurns(turns: number): this {
    this.config.maxTurns = turns;
    return this;
  }

  /**
   * Set temperature
   */
  temperature(temp: number): this {
    this.config.temperature = temp;
    return this;
  }

  /**
   * Build the agent
   */
  build(): Agent<TContext, TOutput> {
    if (!this.config.name) {
      throw new Error("Agent name is required");
    }
    if (!this.config.instructions) {
      throw new Error("Agent instructions are required");
    }

    return createAgent(this.config as AgentConfig<TContext, TOutput>);
  }
}

/**
 * Create an agent builder
 */
export function agentBuilder<
  TContext = unknown,
  TOutput = string,
>(): AgentBuilder<TContext, TOutput> {
  return new AgentBuilder<TContext, TOutput>();
}
