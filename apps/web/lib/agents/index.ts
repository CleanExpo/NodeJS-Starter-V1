/**
 * AI Agents Module
 *
 * This module provides a complete agent framework based on OpenAI Agents SDK patterns.
 *
 * ## Core Components
 *
 * - **Agent**: LLMs configured with instructions, tools, guardrails, and handoffs
 * - **Tools**: Function tools with Zod schema validation
 * - **Context**: Dependency injection for services and state
 * - **Guardrails**: Input/output validation and safety checks
 * - **Handoffs**: Transfer control between specialized agents
 * - **Runner**: Execute agents with conversation management
 *
 * ## Quick Start
 *
 * ```typescript
 * import { Agent, tool, createRunner, createContext } from '@/lib/agents';
 * import { z } from 'zod';
 *
 * // 1. Create a tool
 * const searchTool = tool({
 *   name: 'search',
 *   description: 'Search for information',
 *   parameters: z.object({ query: z.string() }),
 *   execute: async ({ query }) => `Results for: ${query}`,
 * });
 *
 * // 2. Create an agent
 * const agent = Agent.create({
 *   name: 'SearchAssistant',
 *   instructions: 'You help users find information.',
 *   tools: [searchTool],
 * });
 *
 * // 3. Create runner and context
 * const runner = createRunner({ modelProvider });
 * const ctx = createContext({ userId: 'user_123' });
 *
 * // 4. Run the agent
 * const result = await runner.run(agent, 'Search for cats', { context: ctx });
 * console.log(result.finalOutput);
 * ```
 *
 * ## Multi-Agent Patterns
 *
 * ### Manager Pattern (Agent as Tool)
 * ```typescript
 * const manager = Agent.create({
 *   name: 'Manager',
 *   instructions: 'Coordinate specialists',
 *   tools: [agentAsTool(specialist1), agentAsTool(specialist2)],
 * });
 * ```
 *
 * ### Handoff Pattern
 * ```typescript
 * const triage = Agent.create({
 *   name: 'Triage',
 *   instructions: 'Route to specialists',
 *   handoffs: [
 *     handoff({ targetAgent: technical, description: 'Tech issues' }),
 *     handoff({ targetAgent: billing, description: 'Billing issues' }),
 *   ],
 * });
 * ```
 *
 * ## Documentation
 *
 * Based on OpenAI Agents SDK:
 * - https://openai.github.io/openai-agents-js/
 * - https://github.com/openai/openai-agents-js
 */

// ============================================================================
// Core Agent Framework
// ============================================================================

export * from "./core";

// ============================================================================
// Example Agents
// ============================================================================

export * from "./examples";

// ============================================================================
// SDK Integration Agents
// ============================================================================

export * from "./sdk";

// ============================================================================
// Independent Verifier (Legacy)
// ============================================================================

export {
  IndependentVerifier,
  independentVerifier,
} from "./independent-verifier";

export type {
  VerificationRequest,
  VerificationResult,
  VerificationEvidence,
  VerificationFailure,
  ClaimedOutput,
  CompletionCriterion,
  VerificationType,
} from "./independent-verifier";
