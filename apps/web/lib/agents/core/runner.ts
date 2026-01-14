/**
 * Agent Runner
 *
 * The Runner executes agents and manages the conversation loop.
 * This is the primary way to run agents in production.
 *
 * Based on OpenAI Agents SDK patterns:
 * - https://openai.github.io/openai-agents-js/guides/running-agents/
 */

import type {
  AgentLike,
  RunConfig,
  RunResult,
  Message,
  ModelProvider,
  EventHandler,
  AgentEvent,
} from "./types";
import type { BaseContext } from "./context";
import { Agent } from "./agent";

// ============================================================================
// Runner Class
// ============================================================================

export interface RunnerConfig {
  /** Default model provider */
  modelProvider: ModelProvider;
  /** Default max turns */
  defaultMaxTurns?: number;
  /** Global event handlers */
  eventHandlers?: EventHandler[];
}

export class Runner {
  private config: RunnerConfig;
  private eventHandlers: EventHandler[] = [];

  constructor(config: RunnerConfig) {
    this.config = config;
    this.eventHandlers = config.eventHandlers || [];
  }

  /**
   * Add a global event handler
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
   * Run an agent with the given input and context
   */
  async run<TContext extends BaseContext, TOutput = string>(
    agent: AgentLike<TContext, TOutput>,
    input: string,
    runConfig: RunConfig<TContext>
  ): Promise<RunResult<TOutput>> {
    // Set up the agent with provider and handlers
    if (agent instanceof Agent) {
      agent.setModelProvider(this.config.modelProvider);
      for (const handler of this.eventHandlers) {
        agent.onEvent(handler);
      }
    }

    // Check for abort signal
    if (runConfig.signal?.aborted) {
      throw new Error("Run aborted before start");
    }

    // Run the agent
    const result = await agent.run(input, runConfig.context);

    // Call turn callback if provided
    if (runConfig.onTurn) {
      for (const turn of result.turns) {
        runConfig.onTurn(turn);
      }
    }

    return result;
  }

  /**
   * Run an agent with streaming output
   */
  async *runStream<TContext extends BaseContext, TOutput = string>(
    agent: AgentLike<TContext, TOutput>,
    input: string,
    runConfig: RunConfig<TContext>
  ): AsyncGenerator<
    { type: "chunk"; content: string } | { type: "result"; result: RunResult<TOutput> },
    void,
    unknown
  > {
    // For now, we simulate streaming by running the full agent
    // In a real implementation, this would use the model's streaming API
    const result = await this.run(agent, input, runConfig);

    // Yield the final output as chunks
    const output = String(result.finalOutput);
    const chunkSize = 20;

    for (let i = 0; i < output.length; i += chunkSize) {
      yield { type: "chunk", content: output.slice(i, i + chunkSize) };
      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    yield { type: "result", result };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

let defaultRunner: Runner | null = null;

/**
 * Set the default runner
 */
export function setDefaultRunner(runner: Runner): void {
  defaultRunner = runner;
}

/**
 * Get the default runner
 */
export function getDefaultRunner(): Runner | null {
  return defaultRunner;
}

/**
 * Run an agent using the default runner
 */
export async function run<TContext extends BaseContext, TOutput = string>(
  agent: AgentLike<TContext, TOutput>,
  input: string,
  config: RunConfig<TContext>
): Promise<RunResult<TOutput>> {
  if (!defaultRunner) {
    throw new Error("Default runner not set. Call setDefaultRunner() first.");
  }
  return defaultRunner.run(agent, input, config);
}

/**
 * Create a runner instance
 */
export function createRunner(config: RunnerConfig): Runner {
  return new Runner(config);
}

// ============================================================================
// Model Provider Helpers
// ============================================================================

/**
 * Create a mock model provider for testing
 */
export function createMockProvider(
  responses: Array<{
    content: string;
    toolCalls?: Array<{
      id: string;
      name: string;
      arguments: Record<string, unknown>;
    }>;
  }>
): ModelProvider {
  let responseIndex = 0;

  return {
    name: "mock",
    chat: async () => {
      const response = responses[responseIndex % responses.length];
      responseIndex++;

      return {
        content: response.content,
        toolCalls: response.toolCalls?.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments),
          },
        })),
        finishReason: response.toolCalls ? "tool_calls" : "stop",
      };
    },
  };
}

/**
 * Create a simple echo provider (returns the last user message)
 */
export function createEchoProvider(): ModelProvider {
  return {
    name: "echo",
    chat: async (messages) => {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");

      return {
        content: lastUserMessage?.content || "No input provided",
        finishReason: "stop",
      };
    },
  };
}

// ============================================================================
// Batch Execution
// ============================================================================

export interface BatchRunConfig<TContext extends BaseContext> {
  /** Maximum concurrent runs */
  concurrency?: number;
  /** Context factory for each input */
  contextFactory: (input: string, index: number) => TContext;
  /** Callback for each result */
  onResult?: (input: string, result: RunResult<unknown>, index: number) => void;
  /** Callback for errors */
  onError?: (input: string, error: Error, index: number) => void;
}

export interface BatchResult<TOutput> {
  successful: Array<{ input: string; result: RunResult<TOutput>; index: number }>;
  failed: Array<{ input: string; error: Error; index: number }>;
  totalDuration_ms: number;
}

/**
 * Run an agent on multiple inputs
 */
export async function runBatch<TContext extends BaseContext, TOutput = string>(
  runner: Runner,
  agent: AgentLike<TContext, TOutput>,
  inputs: string[],
  config: BatchRunConfig<TContext>
): Promise<BatchResult<TOutput>> {
  const startTime = Date.now();
  const concurrency = config.concurrency || 5;
  const successful: BatchResult<TOutput>["successful"] = [];
  const failed: BatchResult<TOutput>["failed"] = [];

  // Process in batches
  for (let i = 0; i < inputs.length; i += concurrency) {
    const batch = inputs.slice(i, i + concurrency);

    const promises = batch.map(async (input, batchIndex) => {
      const index = i + batchIndex;
      const ctx = config.contextFactory(input, index);

      try {
        const result = await runner.run(agent, input, { context: ctx });
        config.onResult?.(input, result, index);
        return { success: true as const, input, result, index };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        config.onError?.(input, err, index);
        return { success: false as const, input, error: err, index };
      }
    });

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.success) {
        successful.push({
          input: result.input,
          result: result.result,
          index: result.index,
        });
      } else {
        failed.push({
          input: result.input,
          error: result.error,
          index: result.index,
        });
      }
    }
  }

  return {
    successful,
    failed,
    totalDuration_ms: Date.now() - startTime,
  };
}

// ============================================================================
// Conversation Runner
// ============================================================================

export interface ConversationConfig<TContext extends BaseContext> {
  /** Initial context */
  context: TContext;
  /** System message override */
  systemMessage?: string;
  /** Maximum conversation length */
  maxMessages?: number;
}

/**
 * Run a multi-turn conversation with an agent
 */
export class ConversationRunner<TContext extends BaseContext, TOutput = string> {
  private runner: Runner;
  private agent: AgentLike<TContext, TOutput>;
  private config: ConversationConfig<TContext>;
  private messages: Message[] = [];
  private turnCount = 0;

  constructor(
    runner: Runner,
    agent: AgentLike<TContext, TOutput>,
    config: ConversationConfig<TContext>
  ) {
    this.runner = runner;
    this.agent = agent;
    this.config = config;
  }

  /**
   * Send a message and get a response
   */
  async send(input: string): Promise<RunResult<TOutput>> {
    const maxMessages = this.config.maxMessages || 100;

    if (this.messages.length >= maxMessages) {
      // Trim old messages (keep system + last N)
      const systemMessage = this.messages.find((m) => m.role === "system");
      const recentMessages = this.messages
        .filter((m) => m.role !== "system")
        .slice(-10);
      this.messages = systemMessage
        ? [systemMessage, ...recentMessages]
        : recentMessages;
    }

    const result = await this.runner.run(this.agent, input, {
      context: this.config.context,
      initialMessages: this.messages,
    });

    // Update conversation history
    this.messages = result.messages;
    this.turnCount++;

    return result;
  }

  /**
   * Get the conversation history
   */
  getHistory(): Message[] {
    return [...this.messages];
  }

  /**
   * Get the turn count
   */
  getTurnCount(): number {
    return this.turnCount;
  }

  /**
   * Reset the conversation
   */
  reset(): void {
    this.messages = [];
    this.turnCount = 0;
  }
}

/**
 * Create a conversation runner
 */
export function createConversation<TContext extends BaseContext, TOutput = string>(
  runner: Runner,
  agent: AgentLike<TContext, TOutput>,
  config: ConversationConfig<TContext>
): ConversationRunner<TContext, TOutput> {
  return new ConversationRunner(runner, agent, config);
}
