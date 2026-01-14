/**
 * Swarm Types
 *
 * Type definitions for sub-agent orchestration system.
 * Based on Anthropic's composable patterns for effective agents.
 */

import { z } from "zod";

// ============================================================================
// Core Types
// ============================================================================

export type AgentRole = "orchestrator" | "worker" | "evaluator" | "router" | "wizard";
export type AgentStatus = "idle" | "running" | "waiting" | "completed" | "failed" | "cancelled";
export type Priority = "critical" | "high" | "normal" | "low" | "background";

/**
 * Orchestration patterns based on Anthropic's framework
 */
export type OrchestrationPattern =
  | "snake"           // Sequential: A → B → C (context flows through)
  | "parallel"        // Concurrent: A, B, C run simultaneously
  | "hierarchical"    // Tree: Orchestrator → Workers
  | "evaluator"       // Loop: Generate → Evaluate → Refine
  | "router"          // Branch: Classify → Route to specialist
  | "swarm";          // Dynamic: Spawn as needed

// ============================================================================
// Context Types
// ============================================================================

/**
 * Isolated context window for each sub-agent
 */
export interface AgentContext {
  id: string;
  parentId: string | null;
  depth: number;
  maxTokens: number;
  usedTokens: number;

  // Context data
  messages: ContextMessage[];
  memory: Map<string, unknown>;
  artifacts: Artifact[];

  // State
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number | null;
}

export interface ContextMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp: number;
  tokens?: number;
}

export interface Artifact {
  id: string;
  type: "code" | "document" | "data" | "analysis" | "plan";
  name: string;
  content: unknown;
  createdBy: string;
  createdAt: number;
}

/**
 * Summary sent back to parent orchestrator
 */
export interface ContextSummary {
  agentId: string;
  taskDescription: string;
  result: "success" | "partial" | "failed";
  keyFindings: string[];
  artifacts: string[];  // Artifact IDs
  recommendations: string[];
  tokensUsed: number;
}

// ============================================================================
// Agent Definition Types
// ============================================================================

/**
 * Sub-agent definition
 */
export interface SubAgent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;

  // Capabilities
  capabilities: string[];
  tools: string[];

  // Instructions
  systemPrompt: string;
  constraints: string[];

  // Resource limits
  maxTokens: number;
  maxDuration: number;  // ms
  maxChildren: number;

  // Activation conditions
  triggers: TriggerCondition[];
  priority: Priority;
}

export interface TriggerCondition {
  type: "keyword" | "intent" | "pattern" | "explicit" | "always";
  value: string | RegExp;
  confidence?: number;  // 0-1
}

/**
 * Wizard - specialized domain expert agent
 */
export interface Wizard extends SubAgent {
  domain: string;
  expertise: string[];
  examples: WizardExample[];
  outputFormat?: z.ZodType;
}

export interface WizardExample {
  input: string;
  output: string;
  explanation?: string;
}

// ============================================================================
// Task Types
// ============================================================================

/**
 * Task to be executed by agents
 */
export interface Task {
  id: string;
  type: "analyze" | "generate" | "transform" | "validate" | "execute" | "custom";
  description: string;
  input: unknown;

  // Execution hints
  pattern: OrchestrationPattern;
  requiredCapabilities: string[];
  preferredAgents?: string[];

  // Constraints
  maxAgents: number;
  maxDepth: number;
  timeout: number;
  priority: Priority;

  // State
  status: AgentStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;

  // Results
  result?: TaskResult;
  children: string[];  // Child task IDs
}

export interface TaskResult {
  success: boolean;
  output: unknown;
  summary: string;
  artifacts: Artifact[];
  metrics: TaskMetrics;
  errors?: string[];
}

export interface TaskMetrics {
  totalTokens: number;
  totalDuration: number;
  agentsSpawned: number;
  tasksSplit: number;
}

// ============================================================================
// Orchestration Types
// ============================================================================

/**
 * Orchestration plan generated from prompt
 */
export interface OrchestrationPlan {
  id: string;
  originalPrompt: string;

  // Analysis
  intent: string;
  complexity: "simple" | "moderate" | "complex" | "expert";
  requiredCapabilities: string[];

  // Plan
  pattern: OrchestrationPattern;
  steps: PlanStep[];
  estimatedAgents: number;
  estimatedTokens: number;
  estimatedDuration: number;

  // Approval
  needsApproval: boolean;
  approvalReason?: string;
}

export interface PlanStep {
  id: string;
  order: number;
  agentType: AgentRole;
  agentId?: string;  // Specific agent, or null for auto-select
  description: string;
  input: string;
  dependencies: string[];  // Step IDs this depends on
  parallel: boolean;
}

/**
 * Swarm state
 */
export interface SwarmState {
  activeAgents: Map<string, SubAgent>;
  runningTasks: Map<string, Task>;
  contexts: Map<string, AgentContext>;

  // Resource tracking
  totalTokensUsed: number;
  totalAgentsSpawned: number;

  // Configuration
  maxConcurrentAgents: number;
  maxTotalTokens: number;

  // History
  completedTasks: string[];
  failedTasks: string[];
}

// ============================================================================
// Communication Types
// ============================================================================

/**
 * Message between agents
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: "request" | "response" | "broadcast" | "handoff";
  content: unknown;
  timestamp: number;
  replyTo?: string;
}

/**
 * Handoff from one agent to another
 */
export interface Handoff {
  fromAgent: string;
  toAgent: string;
  reason: string;
  context: ContextSummary;
  continuationPrompt: string;
}

// ============================================================================
// Factory Types
// ============================================================================

/**
 * Agent template for generation
 */
export interface AgentTemplate {
  name: string;
  role: AgentRole;
  basePrompt: string;
  capabilities: string[];
  tools: string[];
  constraints: string[];
}

/**
 * Auto-generation request
 */
export interface GenerateAgentRequest {
  prompt: string;
  purpose: string;
  capabilities?: string[];
  constraints?: string[];
  examples?: WizardExample[];
}

// ============================================================================
// Schemas
// ============================================================================

export const TaskSchema = z.object({
  description: z.string(),
  type: z.enum(["analyze", "generate", "transform", "validate", "execute", "custom"]).optional(),
  pattern: z.enum(["snake", "parallel", "hierarchical", "evaluator", "router", "swarm"]).optional(),
  maxAgents: z.number().optional(),
  timeout: z.number().optional(),
  priority: z.enum(["critical", "high", "normal", "low", "background"]).optional(),
});

export const GenerateAgentSchema = z.object({
  prompt: z.string(),
  purpose: z.string(),
  capabilities: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});
