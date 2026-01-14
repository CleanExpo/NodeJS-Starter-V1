/**
 * OpenAI Agents SDK-style Architecture for AI Project Scaffolding
 *
 * A lightweight, powerful framework for building multi-agent workflows.
 *
 * Based on patterns from:
 * - https://openai.github.io/openai-agents-js/
 * - https://github.com/openai/openai-agents-js
 *
 * Features:
 * - Agents: LLMs configured with instructions, tools, guardrails, and handoffs
 * - Tools: Function tools with Zod schema validation
 * - Handoffs: Transfer control between specialized agents
 * - Guardrails: Input/output validation and safety checks
 * - Context: Dependency injection for services and state
 * - Runner: Execute agents with conversation management
 *
 * @example
 * ```typescript
 * import { Agent, tool, run, createContext } from '@/lib/agents/core';
 * import { z } from 'zod';
 *
 * // Create a tool
 * const greetTool = tool({
 *   name: 'greet',
 *   description: 'Greet a user by name',
 *   parameters: z.object({ name: z.string() }),
 *   execute: ({ name }) => `Hello, ${name}!`,
 * });
 *
 * // Create an agent
 * const agent = Agent.create({
 *   name: 'Greeter',
 *   instructions: 'You are a friendly assistant that greets users.',
 *   tools: [greetTool],
 * });
 *
 * // Run the agent
 * const ctx = createContext({ userId: 'user_123' });
 * const result = await run(agent, 'Say hello to John', { context: ctx });
 * console.log(result.finalOutput);
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Message types
  Message,
  MessageRole,
  ToolCall,
  ToolResult,

  // Tool types
  Tool,
  ToolParameters,
  ToolExecuteContext,

  // Handoff types
  Handoff,
  HandoffInput,

  // Guardrail types
  InputGuardrail,
  OutputGuardrail,
  GuardrailResult,
  GuardrailAction,

  // Agent types
  AgentConfig,
  AgentLike,

  // Runner types
  RunConfig,
  RunResult,
  Turn,

  // Model types
  ModelProvider,
  ModelOptions,
  ModelTool,
  ModelResponse,
  ModelChunk,

  // Tracing types
  Trace,
  TraceSpan,

  // Event types
  AgentEvent,
  EventHandler,
} from "./types";

// ============================================================================
// Agent
// ============================================================================

export {
  Agent,
  createAgent,
  simpleAgent,
  toolAgent,
  AgentBuilder,
  agentBuilder,
} from "./agent";

// ============================================================================
// Tools
// ============================================================================

export {
  tool,
  zodToJsonSchema,
  toolToModelFormat,
  toolsToModelFormat,
  executeTool,
  timestampTool,
  waitTool,
  calculateTool,
  ToolRegistry,
  createToolRegistry,
} from "./tool";

export type { ToolOptions } from "./tool";

// ============================================================================
// Context
// ============================================================================

export {
  createContext,
  withContext,
  newRunContext,
  hasFeature,
  getService,
  setMetadata,
  ContextWrapper,
  wrapContext,
  ContextBuilder,
  contextBuilder,
  createAustralianContext,
} from "./context";

export type {
  BaseContext,
  CreateContextOptions,
  WebRequestContext,
  ChatContext,
  TaskContext,
  AustralianContext,
} from "./context";

// ============================================================================
// Guardrails
// ============================================================================

export {
  inputGuardrail,
  outputGuardrail,
  continueResult,
  stopResult,
  escalateResult,
  emptyInputGuardrail,
  maxLengthGuardrail,
  patternBlockGuardrail,
  promptInjectionGuardrail,
  requireKeywordsGuardrail,
  sensitiveDataGuardrail,
  maxOutputLengthGuardrail,
  requiredSectionsGuardrail,
  blockedWordsGuardrail,
  combineInputGuardrails,
  combineOutputGuardrails,
  runGuardrails,
} from "./guardrail";

export type {
  InputGuardrailOptions,
  OutputGuardrailOptions,
  GuardrailRunResult,
} from "./guardrail";

// ============================================================================
// Handoffs
// ============================================================================

export {
  handoff,
  handoffToTool,
  handoffsToTools,
  createRouter,
  keywordSelector,
  patternSelector,
  executeChain,
  executeParallel,
  agentAsTool,
  agentsAsTools,
} from "./handoff";

export type {
  HandoffOptions,
  RouterConfig,
  ChainConfig,
  ParallelConfig,
} from "./handoff";

// ============================================================================
// Runner
// ============================================================================

export {
  Runner,
  createRunner,
  setDefaultRunner,
  getDefaultRunner,
  run,
  runBatch,
  createMockProvider,
  createEchoProvider,
  ConversationRunner,
  createConversation,
} from "./runner";

export type {
  RunnerConfig,
  BatchRunConfig,
  BatchResult,
  ConversationConfig,
} from "./runner";
