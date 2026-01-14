/**
 * Core Types for OpenAI Agents SDK-style Architecture
 *
 * Based on patterns from:
 * - https://openai.github.io/openai-agents-js/
 * - https://github.com/openai/openai-agents-js
 *
 * Implements:
 * - Agent generic types with context support
 * - Tool definitions with Zod schema validation
 * - Handoff specifications for multi-agent orchestration
 * - Guardrail types for input/output validation
 */

import type { z } from "zod";

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  output: string;
  error?: string;
}

// ============================================================================
// Tool Types
// ============================================================================

export interface ToolParameters<T extends z.ZodType = z.ZodType> {
  schema: T;
  description?: string;
}

export interface ToolExecuteContext<TContext = unknown> {
  context: TContext;
  agentName: string;
  runId: string;
}

export interface Tool<
  TInput extends z.ZodType = z.ZodType,
  TOutput = unknown,
  TContext = unknown,
> {
  name: string;
  description: string;
  parameters: TInput;
  execute: (
    input: z.infer<TInput>,
    ctx: ToolExecuteContext<TContext>
  ) => Promise<TOutput> | TOutput;
  errorFunction?: (error: Error, input: z.infer<TInput>) => string;
}

// ============================================================================
// Handoff Types
// ============================================================================

export interface HandoffInput {
  reason: string;
  context?: Record<string, unknown>;
}

export interface Handoff<TContext = unknown> {
  /** Target agent to hand off to */
  targetAgent: AgentLike<TContext>;
  /** Description of when to use this handoff */
  description: string;
  /** Filter function to determine if handoff applies */
  filter?: (input: HandoffInput, ctx: TContext) => boolean | Promise<boolean>;
  /** Transform context before handoff */
  transformContext?: (ctx: TContext, input: HandoffInput) => TContext;
}

// ============================================================================
// Guardrail Types
// ============================================================================

export type GuardrailAction = "continue" | "stop" | "escalate";

export interface GuardrailResult {
  action: GuardrailAction;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface InputGuardrail<TContext = unknown> {
  name: string;
  description?: string;
  validate: (
    input: string,
    ctx: TContext
  ) => Promise<GuardrailResult> | GuardrailResult;
}

export interface OutputGuardrail<TContext = unknown> {
  name: string;
  description?: string;
  validate: (
    output: string,
    ctx: TContext
  ) => Promise<GuardrailResult> | GuardrailResult;
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentConfig<TContext = unknown, TOutput = string> {
  /** Unique name for the agent */
  name: string;
  /** System instructions for the agent */
  instructions: string | ((ctx: TContext) => string | Promise<string>);
  /** Model to use (defaults to configured default) */
  model?: string;
  /** Tools available to the agent */
  tools?: Tool<z.ZodType, unknown, TContext>[];
  /** Agents this agent can hand off to */
  handoffs?: Handoff<TContext>[];
  /** Input validation guardrails */
  inputGuardrails?: InputGuardrail<TContext>[];
  /** Output validation guardrails */
  outputGuardrails?: OutputGuardrail<TContext>[];
  /** Output schema for structured output */
  outputType?: z.ZodType<TOutput>;
  /** Maximum turns in the agent loop */
  maxTurns?: number;
  /** Temperature for model (0-1) */
  temperature?: number;
}

export interface AgentLike<TContext = unknown, TOutput = string> {
  name: string;
  config: AgentConfig<TContext, TOutput>;
  run: (input: string, ctx: TContext) => Promise<RunResult<TOutput>>;
}

// ============================================================================
// Runner Types
// ============================================================================

export interface RunConfig<TContext = unknown> {
  /** Context object passed to tools and guardrails */
  context: TContext;
  /** Maximum iterations of the agent loop */
  maxTurns?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Callback for each turn */
  onTurn?: (turn: Turn) => void;
  /** Callback for streaming chunks */
  onChunk?: (chunk: string) => void;
  /** Initial messages to seed the conversation */
  initialMessages?: Message[];
}

export interface Turn {
  index: number;
  agentName: string;
  input: string;
  output?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  handoff?: {
    targetAgent: string;
    reason: string;
  };
  duration_ms: number;
}

export interface RunResult<TOutput = string> {
  /** Final output from the agent */
  finalOutput: TOutput;
  /** Whether a structured output was produced */
  isStructured: boolean;
  /** All messages in the conversation */
  messages: Message[];
  /** All turns taken */
  turns: Turn[];
  /** Total duration in milliseconds */
  totalDuration_ms: number;
  /** Agent that produced the final output */
  finalAgent: string;
  /** Number of tool calls made */
  toolCallCount: number;
  /** Whether a handoff occurred */
  hadHandoff: boolean;
  /** Run ID for tracing */
  runId: string;
}

// ============================================================================
// Tracing Types
// ============================================================================

export interface TraceSpan {
  id: string;
  parentId?: string;
  name: string;
  type: "agent" | "tool" | "handoff" | "guardrail" | "model";
  startTime: number;
  endTime?: number;
  status: "running" | "completed" | "error";
  input?: unknown;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface Trace {
  id: string;
  runId: string;
  spans: TraceSpan[];
  startTime: number;
  endTime?: number;
  status: "running" | "completed" | "error";
}

// ============================================================================
// Provider Types
// ============================================================================

export interface ModelProvider {
  name: string;
  chat: (
    messages: Message[],
    options: ModelOptions
  ) => Promise<ModelResponse>;
  streamChat?: (
    messages: Message[],
    options: ModelOptions
  ) => AsyncIterable<ModelChunk>;
}

export interface ModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ModelTool[];
  toolChoice?: "auto" | "required" | "none" | { type: "function"; name: string };
  responseFormat?: { type: "json_object" } | { type: "json_schema"; schema: unknown };
  signal?: AbortSignal;
}

export interface ModelTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ModelResponse {
  content: string | null;
  toolCalls?: ToolCall[];
  finishReason: "stop" | "tool_calls" | "length" | "content_filter";
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelChunk {
  content?: string;
  toolCall?: Partial<ToolCall>;
  finishReason?: ModelResponse["finishReason"];
}

// ============================================================================
// Event Types (for observability)
// ============================================================================

export type AgentEvent =
  | { type: "run_start"; runId: string; agentName: string; input: string }
  | { type: "run_end"; runId: string; result: RunResult<unknown> }
  | { type: "turn_start"; runId: string; turnIndex: number }
  | { type: "turn_end"; runId: string; turn: Turn }
  | { type: "tool_start"; runId: string; toolName: string; input: unknown }
  | { type: "tool_end"; runId: string; toolName: string; output: unknown }
  | { type: "tool_error"; runId: string; toolName: string; error: Error }
  | { type: "handoff"; runId: string; from: string; to: string; reason: string }
  | { type: "guardrail_triggered"; runId: string; guardrailName: string; result: GuardrailResult }
  | { type: "model_call"; runId: string; model: string; messages: Message[] }
  | { type: "model_response"; runId: string; response: ModelResponse };

export type EventHandler = (event: AgentEvent) => void;
