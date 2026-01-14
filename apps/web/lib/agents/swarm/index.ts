/**
 * Swarm - Sub-Agent Orchestration System
 *
 * Auto-generates and orchestrates sub-agents from simple human prompts.
 * Based on Anthropic's composable patterns for building effective agents.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createSwarm, analyzePrompt } from '@/lib/agents/swarm';
 *
 * // Create swarm with your executor
 * const swarm = createSwarm(myExecutor);
 *
 * // Process any prompt - system decides orchestration automatically
 * const result = await swarm.process("Refactor the auth module and add tests");
 *
 * // Or analyze first without executing
 * const analysis = analyzePrompt("Build a new API endpoint");
 * console.log(analysis.decision.pattern); // "hierarchical"
 * console.log(analysis.recommendedWizards); // [apiWizard, testingWizard]
 * ```
 *
 * ## Orchestration Patterns
 *
 * - **snake**: Sequential chain, A → B → C
 * - **parallel**: Concurrent execution, aggregate results
 * - **hierarchical**: Orchestrator delegates to workers
 * - **evaluator**: Generate → Evaluate → Refine loop
 * - **router**: Classify → Route to specialist
 * - **swarm**: Dynamic spawning based on needs
 *
 * ## Wizards (Domain Experts)
 *
 * Pre-built specialized agents:
 * - TypeScript, React, API, Testing
 * - Security, Performance, DevOps, Architecture
 *
 * ## Features
 *
 * - Auto-generates agents from prompts
 * - Isolated context windows per sub-agent
 * - Intelligent activation decisions
 * - Resource and concurrency management
 * - Pattern-based orchestration
 */

// Types
export type {
  SubAgent,
  Wizard,
  Task,
  TaskResult,
  OrchestrationPattern,
  OrchestrationPlan,
  AgentContext,
  ContextSummary,
  SwarmState,
  AgentRole,
  AgentStatus,
  Priority,
  PlanStep,
  Artifact,
  GenerateAgentRequest,
  WizardExample,
} from "./types";

export { TaskSchema, GenerateAgentSchema } from "./types";

// Context Management
export {
  createContext,
  createChildContext,
  addMessage,
  addArtifact,
  setMemory,
  getMemory,
  hasCapacity,
  isExpired,
  summarizeContext,
  compressContext,
  extractForHandoff,
  buildPrompt,
  estimateTokens,
  formatContext,
} from "./context";

// Agent Factory
export {
  generateAgent,
  generateWizard,
  analyzeIntent,
  getTemplates,
  registerTemplate,
  fromTemplate,
} from "./factory";

// Orchestration Patterns
export {
  snakePattern,
  parallelPattern,
  hierarchicalPattern,
  evaluatorPattern,
  routerPattern,
  swarmPattern,
  getPattern,
  selectPattern,
  PATTERNS,
} from "./patterns";

export type { PatternExecutor, AgentExecutor } from "./patterns";

// Wizards
export {
  getWizard,
  getAllWizards,
  registerWizard,
  findWizards,
  selectWizard,
  recommendWizards,
  // Pre-built wizards
  typescriptWizard,
  reactWizard,
  apiWizard,
  testingWizard,
  securityWizard,
  performanceWizard,
  devopsWizard,
  architectureWizard,
} from "./wizards";

// Activation Intelligence
export {
  decideActivation,
  needsSubAgents,
  getActivationRecommendation,
  analyzeComplexity,
} from "./activation";

export type { ActivationDecision, ComplexityAnalysis } from "./activation";

// Swarm Orchestrator
export {
  Swarm,
  createSwarm,
  createMockExecutor,
  processPrompt,
  analyzePrompt,
} from "./swarm";

export type { SwarmConfig } from "./swarm";
