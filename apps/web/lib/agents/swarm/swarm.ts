/**
 * Swarm Orchestrator
 *
 * Main entry point for sub-agent orchestration.
 * Takes simple human prompts and orchestrates agents to complete tasks.
 */

import type {
  SubAgent,
  Task,
  TaskResult,
  SwarmState,
  OrchestrationPattern,
  AgentContext,
  Priority,
} from "./types";
import { createContext, createChildContext, addMessage, summarizeContext } from "./context";
import { generateAgent, analyzeIntent } from "./factory";
import { getPattern, selectPattern, AgentExecutor } from "./patterns";
import { recommendWizards, getWizard, getAllWizards } from "./wizards";
import { decideActivation, needsSubAgents, analyzeComplexity } from "./activation";

// ============================================================================
// Swarm Configuration
// ============================================================================

export interface SwarmConfig {
  maxConcurrentAgents: number;
  maxTotalTokens: number;
  defaultTimeout: number;
  autoActivate: boolean;
  requireApproval: boolean;
}

const DEFAULT_CONFIG: SwarmConfig = {
  maxConcurrentAgents: 10,
  maxTotalTokens: 1000000,
  defaultTimeout: 300000,  // 5 minutes
  autoActivate: true,
  requireApproval: false,
};

// ============================================================================
// Swarm Class
// ============================================================================

export class Swarm {
  private state: SwarmState;
  private config: SwarmConfig;
  private executor: AgentExecutor;

  constructor(executor: AgentExecutor, config: Partial<SwarmConfig> = {}) {
    this.executor = executor;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.state = {
      activeAgents: new Map(),
      runningTasks: new Map(),
      contexts: new Map(),
      totalTokensUsed: 0,
      totalAgentsSpawned: 0,
      maxConcurrentAgents: this.config.maxConcurrentAgents,
      maxTotalTokens: this.config.maxTotalTokens,
      completedTasks: [],
      failedTasks: [],
    };
  }

  // ==========================================================================
  // Main API
  // ==========================================================================

  /**
   * Process a prompt using optimal orchestration
   */
  async process(prompt: string): Promise<TaskResult> {
    // Analyze what's needed
    const decision = decideActivation(prompt);

    if (!decision.shouldActivate || !this.config.autoActivate) {
      // Simple single-agent execution
      return this.executeSingle(prompt);
    }

    // Check approval if required
    if (this.config.requireApproval && decision.plan.needsApproval) {
      return {
        success: false,
        output: null,
        summary: `Task requires approval: ${decision.plan.approvalReason}`,
        artifacts: [],
        metrics: { totalTokens: 0, totalDuration: 0, agentsSpawned: 0, tasksSplit: 0 },
        errors: ["Approval required"],
      };
    }

    // Execute with sub-agents
    return this.executeWithAgents(prompt, decision.pattern, decision.agentCount);
  }

  /**
   * Execute with specific pattern
   */
  async executeWithPattern(
    prompt: string,
    pattern: OrchestrationPattern,
    agentCount?: number
  ): Promise<TaskResult> {
    return this.executeWithAgents(prompt, pattern, agentCount || 3);
  }

  /**
   * Get recommended approach for a prompt
   */
  analyze(prompt: string): {
    complexity: ReturnType<typeof analyzeComplexity>;
    decision: ReturnType<typeof decideActivation>;
    recommendedWizards: Array<{ domain: string; name: string }>;
  } {
    return {
      complexity: analyzeComplexity(prompt),
      decision: decideActivation(prompt),
      recommendedWizards: recommendWizards(prompt).map(w => ({
        domain: w.domain,
        name: w.name,
      })),
    };
  }

  // ==========================================================================
  // Execution Methods
  // ==========================================================================

  /**
   * Execute with single agent (no orchestration)
   */
  private async executeSingle(prompt: string): Promise<TaskResult> {
    const startTime = Date.now();
    const context = createContext({ maxTokens: 100000 });

    // Try to use a wizard if applicable
    const wizard = recommendWizards(prompt, 1)[0];
    const agent = wizard || generateAgent({
      prompt,
      purpose: "Process user request",
    });

    this.state.activeAgents.set(agent.id, agent);
    this.state.totalAgentsSpawned++;

    addMessage(context, "system", agent.systemPrompt);
    addMessage(context, "user", prompt);

    try {
      const result = await this.executor(agent, prompt, context);

      this.state.activeAgents.delete(agent.id);
      this.state.totalTokensUsed += context.usedTokens;

      return {
        success: result.success,
        output: result.output,
        summary: `Single agent execution: ${agent.name}`,
        artifacts: context.artifacts,
        metrics: {
          totalTokens: context.usedTokens,
          totalDuration: Date.now() - startTime,
          agentsSpawned: 1,
          tasksSplit: 0,
        },
      };
    } catch (error) {
      this.state.activeAgents.delete(agent.id);
      return {
        success: false,
        output: null,
        summary: "Execution failed",
        artifacts: [],
        metrics: {
          totalTokens: context.usedTokens,
          totalDuration: Date.now() - startTime,
          agentsSpawned: 1,
          tasksSplit: 0,
        },
        errors: [String(error)],
      };
    }
  }

  /**
   * Execute with multiple agents using pattern
   */
  private async executeWithAgents(
    prompt: string,
    pattern: OrchestrationPattern,
    agentCount: number
  ): Promise<TaskResult> {
    // Check resource limits
    if (this.state.activeAgents.size + agentCount > this.config.maxConcurrentAgents) {
      return {
        success: false,
        output: null,
        summary: "Resource limit reached",
        artifacts: [],
        metrics: { totalTokens: 0, totalDuration: 0, agentsSpawned: 0, tasksSplit: 0 },
        errors: [`Max concurrent agents (${this.config.maxConcurrentAgents}) would be exceeded`],
      };
    }

    // Get agents (prefer wizards, fall back to generated)
    const agents = this.selectAgents(prompt, agentCount);

    // Register agents
    for (const agent of agents) {
      this.state.activeAgents.set(agent.id, agent);
      this.state.totalAgentsSpawned++;
    }

    // Create task
    const task: Task = {
      id: `task-${Date.now().toString(36)}`,
      type: "custom",
      description: prompt,
      input: prompt,
      pattern,
      requiredCapabilities: analyzeIntent(prompt).requiredCapabilities,
      maxAgents: agentCount,
      maxDepth: 3,
      timeout: this.config.defaultTimeout,
      priority: "normal",
      status: "running",
      createdAt: Date.now(),
      startedAt: Date.now(),
      children: [],
    };

    this.state.runningTasks.set(task.id, task);

    try {
      // Execute pattern
      const patternExecutor = getPattern(pattern);
      const result = await patternExecutor.execute(task, agents, this.executor);

      // Update state
      task.status = result.success ? "completed" : "failed";
      task.completedAt = Date.now();
      task.result = result;

      if (result.success) {
        this.state.completedTasks.push(task.id);
      } else {
        this.state.failedTasks.push(task.id);
      }

      this.state.totalTokensUsed += result.metrics.totalTokens;

      return result;
    } catch (error) {
      task.status = "failed";
      this.state.failedTasks.push(task.id);

      return {
        success: false,
        output: null,
        summary: "Pattern execution failed",
        artifacts: [],
        metrics: { totalTokens: 0, totalDuration: Date.now() - (task.startedAt || Date.now()), agentsSpawned: agentCount, tasksSplit: 0 },
        errors: [String(error)],
      };
    } finally {
      // Cleanup
      for (const agent of agents) {
        this.state.activeAgents.delete(agent.id);
      }
      this.state.runningTasks.delete(task.id);
    }
  }

  /**
   * Select appropriate agents for task
   */
  private selectAgents(prompt: string, count: number): SubAgent[] {
    const agents: SubAgent[] = [];

    // Get recommended wizards
    const wizards = recommendWizards(prompt, count);
    agents.push(...wizards);

    // Generate additional agents if needed
    while (agents.length < count) {
      const agent = generateAgent({
        prompt,
        purpose: `Support agent ${agents.length + 1}`,
      });
      agents.push(agent);
    }

    return agents.slice(0, count);
  }

  // ==========================================================================
  // State & Stats
  // ==========================================================================

  /**
   * Get current swarm state
   */
  getState(): Readonly<SwarmState> {
    return this.state;
  }

  /**
   * Get swarm statistics
   */
  getStats(): {
    activeAgents: number;
    runningTasks: number;
    totalTokensUsed: number;
    totalAgentsSpawned: number;
    completedTasks: number;
    failedTasks: number;
    availableTokens: number;
  } {
    return {
      activeAgents: this.state.activeAgents.size,
      runningTasks: this.state.runningTasks.size,
      totalTokensUsed: this.state.totalTokensUsed,
      totalAgentsSpawned: this.state.totalAgentsSpawned,
      completedTasks: this.state.completedTasks.length,
      failedTasks: this.state.failedTasks.length,
      availableTokens: this.config.maxTotalTokens - this.state.totalTokensUsed,
    };
  }

  /**
   * List available wizards
   */
  listWizards(): Array<{ domain: string; name: string; expertise: string[] }> {
    return getAllWizards().map(w => ({
      domain: w.domain,
      name: w.name,
      expertise: w.expertise,
    }));
  }

  /**
   * Reset swarm state
   */
  reset(): void {
    this.state = {
      activeAgents: new Map(),
      runningTasks: new Map(),
      contexts: new Map(),
      totalTokensUsed: 0,
      totalAgentsSpawned: 0,
      maxConcurrentAgents: this.config.maxConcurrentAgents,
      maxTotalTokens: this.config.maxTotalTokens,
      completedTasks: [],
      failedTasks: [],
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new swarm instance
 */
export function createSwarm(
  executor: AgentExecutor,
  config?: Partial<SwarmConfig>
): Swarm {
  return new Swarm(executor, config);
}

/**
 * Create a mock executor for demo/testing
 */
export function createMockExecutor(): AgentExecutor {
  return async (agent, input, context) => {
    // Simulate processing
    addMessage(context, "assistant", `[${agent.name}] Processing: ${input.slice(0, 100)}...`);

    // Mock successful response
    return {
      output: `Mock output from ${agent.name} for task: ${input.slice(0, 50)}...`,
      success: true,
    };
  };
}

// ============================================================================
// Quick API
// ============================================================================

/**
 * Quick process using default swarm
 */
let defaultSwarm: Swarm | null = null;

export function processPrompt(
  prompt: string,
  executor?: AgentExecutor
): Promise<TaskResult> {
  if (!defaultSwarm) {
    defaultSwarm = createSwarm(executor || createMockExecutor());
  }
  return defaultSwarm.process(prompt);
}

/**
 * Analyze prompt without executing
 */
export function analyzePrompt(prompt: string) {
  return {
    needsSubAgents: needsSubAgents(prompt),
    complexity: analyzeComplexity(prompt),
    decision: decideActivation(prompt),
    recommendedWizards: recommendWizards(prompt),
  };
}
