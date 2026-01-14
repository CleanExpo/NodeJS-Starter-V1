/**
 * Orchestration Patterns
 *
 * Implementation of Anthropic's composable patterns for agent orchestration:
 * - Snake (Sequential chain)
 * - Parallel (Concurrent execution)
 * - Hierarchical (Orchestrator-Workers)
 * - Evaluator (Generate-Evaluate loop)
 * - Router (Classification-based routing)
 * - Swarm (Dynamic spawning)
 */

import type {
  SubAgent,
  Task,
  TaskResult,
  OrchestrationPattern,
  AgentContext,
  ContextSummary,
  PlanStep,
} from "./types";
import { createContext, createChildContext, summarizeContext, addMessage } from "./context";

// ============================================================================
// Pattern Interface
// ============================================================================

export interface PatternExecutor {
  name: OrchestrationPattern;
  description: string;
  execute: (
    task: Task,
    agents: SubAgent[],
    executor: AgentExecutor
  ) => Promise<TaskResult>;
}

/**
 * Function that actually runs an agent
 * This is injected to allow different execution backends
 */
export type AgentExecutor = (
  agent: SubAgent,
  input: string,
  context: AgentContext
) => Promise<{ output: string; success: boolean }>;

// ============================================================================
// Snake Pattern (Sequential Chain)
// ============================================================================

/**
 * Snake Pattern: A → B → C
 * Output of each agent becomes input for the next.
 * Context flows through the entire chain.
 */
export const snakePattern: PatternExecutor = {
  name: "snake",
  description: "Sequential execution where output flows to next agent",

  async execute(task, agents, executor) {
    const startTime = Date.now();
    const artifacts: TaskResult["artifacts"] = [];
    let currentInput = String(task.input);
    let totalTokens = 0;

    // Create chain context that flows through
    const chainContext = createContext({ maxTokens: task.maxAgents * 50000 });
    addMessage(chainContext, "system", `Task: ${task.description}`);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const isLast = i === agents.length - 1;

      // Create agent's own context (child of chain)
      const agentContext = createChildContext(chainContext, { inherit: true });
      addMessage(agentContext, "user", currentInput);

      // Execute
      const result = await executor(agent, currentInput, agentContext);
      totalTokens += agentContext.usedTokens;

      if (!result.success) {
        return {
          success: false,
          output: null,
          summary: `Chain failed at agent ${i + 1}/${agents.length}: ${agent.name}`,
          artifacts,
          metrics: {
            totalTokens,
            totalDuration: Date.now() - startTime,
            agentsSpawned: i + 1,
            tasksSplit: 0,
          },
          errors: [`Agent ${agent.name} failed`],
        };
      }

      // Output becomes next input
      addMessage(chainContext, "assistant", `[${agent.name}] ${result.output}`);
      currentInput = result.output;

      // Record artifact
      artifacts.push({
        id: `snake-${i}`,
        type: "analysis",
        name: `${agent.name} output`,
        content: result.output,
        createdBy: agent.id,
        createdAt: Date.now(),
      });
    }

    return {
      success: true,
      output: currentInput,
      summary: `Snake chain completed: ${agents.length} agents processed sequentially`,
      artifacts,
      metrics: {
        totalTokens,
        totalDuration: Date.now() - startTime,
        agentsSpawned: agents.length,
        tasksSplit: 0,
      },
    };
  },
};

// ============================================================================
// Parallel Pattern
// ============================================================================

/**
 * Parallel Pattern: A, B, C run simultaneously
 * All agents work on the same input independently.
 * Results are aggregated at the end.
 */
export const parallelPattern: PatternExecutor = {
  name: "parallel",
  description: "Concurrent execution with result aggregation",

  async execute(task, agents, executor) {
    const startTime = Date.now();
    const input = String(task.input);

    // Execute all agents in parallel
    const promises = agents.map(async (agent) => {
      const agentContext = createContext({ maxTokens: 50000 });
      addMessage(agentContext, "system", `Task: ${task.description}`);
      addMessage(agentContext, "user", input);

      const result = await executor(agent, input, agentContext);
      return {
        agent,
        result,
        tokens: agentContext.usedTokens,
      };
    });

    const results = await Promise.all(promises);

    // Aggregate results
    const successful = results.filter(r => r.result.success);
    const failed = results.filter(r => !r.result.success);
    const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);

    const artifacts = results.map((r, i) => ({
      id: `parallel-${i}`,
      type: "analysis" as const,
      name: `${r.agent.name} output`,
      content: r.result.output,
      createdBy: r.agent.id,
      createdAt: Date.now(),
    }));

    // Combine outputs
    const combinedOutput = successful
      .map(r => `[${r.agent.name}]\n${r.result.output}`)
      .join("\n\n---\n\n");

    return {
      success: successful.length > 0,
      output: combinedOutput,
      summary: `Parallel execution: ${successful.length}/${agents.length} succeeded`,
      artifacts,
      metrics: {
        totalTokens,
        totalDuration: Date.now() - startTime,
        agentsSpawned: agents.length,
        tasksSplit: agents.length,
      },
      errors: failed.map(f => `${f.agent.name} failed`),
    };
  },
};

// ============================================================================
// Hierarchical Pattern (Orchestrator-Workers)
// ============================================================================

/**
 * Hierarchical Pattern: Orchestrator delegates to Workers
 * Central agent breaks down task and assigns to specialists.
 */
export const hierarchicalPattern: PatternExecutor = {
  name: "hierarchical",
  description: "Orchestrator delegates subtasks to worker agents",

  async execute(task, agents, executor) {
    const startTime = Date.now();
    const input = String(task.input);

    // First agent is orchestrator
    const orchestrator = agents[0];
    const workers = agents.slice(1);

    // Orchestrator context
    const orchContext = createContext({ maxTokens: 100000 });
    addMessage(orchContext, "system", `You are the orchestrator. Break down this task and delegate to available workers.
Available workers: ${workers.map(w => `${w.name} (${w.capabilities.join(", ")})`).join("; ")}`);
    addMessage(orchContext, "user", input);

    // Get orchestrator's plan
    const planResult = await executor(orchestrator, input, orchContext);
    if (!planResult.success) {
      return {
        success: false,
        output: null,
        summary: "Orchestrator failed to create plan",
        artifacts: [],
        metrics: {
          totalTokens: orchContext.usedTokens,
          totalDuration: Date.now() - startTime,
          agentsSpawned: 1,
          tasksSplit: 0,
        },
        errors: ["Orchestrator planning failed"],
      };
    }

    // Execute workers based on plan
    // (In production, would parse plan and delegate appropriately)
    const workerResults = await Promise.all(
      workers.map(async (worker) => {
        const workerContext = createChildContext(orchContext);
        addMessage(workerContext, "user", `Based on the plan, complete your part:\n${planResult.output}`);

        const result = await executor(worker, planResult.output, workerContext);
        return {
          worker,
          result,
          summary: summarizeContext(workerContext, {
            taskDescription: worker.description,
            result: result.success ? "success" : "failed",
            keyFindings: [result.output.slice(0, 200)],
          }),
        };
      })
    );

    // Synthesize results
    const workerSummaries = workerResults
      .filter(r => r.result.success)
      .map(r => r.summary);

    addMessage(orchContext, "assistant", `Worker results:\n${JSON.stringify(workerSummaries, null, 2)}`);

    // Get final synthesis from orchestrator
    const synthResult = await executor(
      orchestrator,
      `Synthesize these worker results into a final output:\n${workerSummaries.map(s => s.keyFindings.join("\n")).join("\n\n")}`,
      orchContext
    );

    const artifacts = [
      {
        id: "plan",
        type: "plan" as const,
        name: "Orchestrator Plan",
        content: planResult.output,
        createdBy: orchestrator.id,
        createdAt: Date.now(),
      },
      ...workerResults.map((r, i) => ({
        id: `worker-${i}`,
        type: "analysis" as const,
        name: `${r.worker.name} output`,
        content: r.result.output,
        createdBy: r.worker.id,
        createdAt: Date.now(),
      })),
    ];

    return {
      success: synthResult.success,
      output: synthResult.output,
      summary: `Hierarchical: Orchestrator coordinated ${workers.length} workers`,
      artifacts,
      metrics: {
        totalTokens: orchContext.usedTokens + workerResults.reduce((s, r) => s + (r.summary.tokensUsed), 0),
        totalDuration: Date.now() - startTime,
        agentsSpawned: agents.length,
        tasksSplit: workers.length,
      },
    };
  },
};

// ============================================================================
// Evaluator Pattern (Generate-Evaluate Loop)
// ============================================================================

/**
 * Evaluator Pattern: Generate → Evaluate → Refine
 * One agent generates, another evaluates, loops until satisfied.
 */
export const evaluatorPattern: PatternExecutor = {
  name: "evaluator",
  description: "Generate-evaluate-refine loop until quality threshold met",

  async execute(task, agents, executor) {
    const startTime = Date.now();
    const maxIterations = 3;

    // Need at least 2 agents: generator and evaluator
    if (agents.length < 2) {
      return {
        success: false,
        output: null,
        summary: "Evaluator pattern requires at least 2 agents",
        artifacts: [],
        metrics: { totalTokens: 0, totalDuration: 0, agentsSpawned: 0, tasksSplit: 0 },
        errors: ["Insufficient agents"],
      };
    }

    const generator = agents[0];
    const evaluator = agents[1];
    const input = String(task.input);

    const genContext = createContext({ maxTokens: 100000 });
    const evalContext = createContext({ maxTokens: 50000 });

    addMessage(genContext, "system", "Generate high-quality output. You may receive feedback to improve.");
    addMessage(evalContext, "system", "Evaluate the output. Rate 1-10 and provide specific improvements if < 8.");

    let currentOutput = "";
    let iteration = 0;
    let totalTokens = 0;
    const artifacts: TaskResult["artifacts"] = [];

    while (iteration < maxIterations) {
      iteration++;

      // Generate
      const genPrompt = iteration === 1
        ? input
        : `Previous output:\n${currentOutput}\n\nFeedback:\n${evalContext.messages.slice(-1)[0]?.content}\n\nImprove the output.`;

      addMessage(genContext, "user", genPrompt);
      const genResult = await executor(generator, genPrompt, genContext);
      totalTokens += genContext.usedTokens;

      if (!genResult.success) break;
      currentOutput = genResult.output;

      artifacts.push({
        id: `gen-${iteration}`,
        type: "document",
        name: `Generation ${iteration}`,
        content: currentOutput,
        createdBy: generator.id,
        createdAt: Date.now(),
      });

      // Evaluate
      const evalPrompt = `Evaluate this output (1-10). If < 8, provide specific improvements:\n\n${currentOutput}`;
      addMessage(evalContext, "user", evalPrompt);
      const evalResult = await executor(evaluator, evalPrompt, evalContext);
      totalTokens += evalContext.usedTokens;

      artifacts.push({
        id: `eval-${iteration}`,
        type: "analysis",
        name: `Evaluation ${iteration}`,
        content: evalResult.output,
        createdBy: evaluator.id,
        createdAt: Date.now(),
      });

      // Check if satisfied (look for high score)
      if (/\b(8|9|10)\/10\b|\b(8|9|10) out of 10\b/i.test(evalResult.output)) {
        break;
      }
    }

    return {
      success: true,
      output: currentOutput,
      summary: `Evaluator loop completed in ${iteration} iterations`,
      artifacts,
      metrics: {
        totalTokens,
        totalDuration: Date.now() - startTime,
        agentsSpawned: 2,
        tasksSplit: iteration * 2,
      },
    };
  },
};

// ============================================================================
// Router Pattern
// ============================================================================

/**
 * Router Pattern: Classify → Route to Specialist
 * First agent classifies, then routes to appropriate specialist.
 */
export const routerPattern: PatternExecutor = {
  name: "router",
  description: "Classify input and route to specialized agent",

  async execute(task, agents, executor) {
    const startTime = Date.now();

    // First agent is router, rest are specialists
    const router = agents.find(a => a.role === "router") || agents[0];
    const specialists = agents.filter(a => a.id !== router.id);

    const routerContext = createContext({ maxTokens: 30000 });
    addMessage(routerContext, "system", `Classify the input and select the best specialist.
Available specialists: ${specialists.map(s => `${s.name}: ${s.capabilities.join(", ")}`).join("; ")}
Respond with ONLY the specialist name.`);

    const input = String(task.input);
    addMessage(routerContext, "user", input);

    // Get routing decision
    const routeResult = await executor(router, input, routerContext);
    if (!routeResult.success) {
      return {
        success: false,
        output: null,
        summary: "Router failed to classify",
        artifacts: [],
        metrics: {
          totalTokens: routerContext.usedTokens,
          totalDuration: Date.now() - startTime,
          agentsSpawned: 1,
          tasksSplit: 0,
        },
        errors: ["Routing failed"],
      };
    }

    // Find selected specialist
    const selectedName = routeResult.output.trim();
    const selected = specialists.find(s =>
      s.name.toLowerCase().includes(selectedName.toLowerCase()) ||
      selectedName.toLowerCase().includes(s.name.toLowerCase())
    ) || specialists[0];

    // Execute specialist
    const specContext = createContext({ maxTokens: 100000 });
    addMessage(specContext, "system", selected.systemPrompt);
    addMessage(specContext, "user", input);

    const specResult = await executor(selected, input, specContext);

    return {
      success: specResult.success,
      output: specResult.output,
      summary: `Routed to ${selected.name}`,
      artifacts: [
        {
          id: "route",
          type: "analysis",
          name: "Routing Decision",
          content: { selected: selected.name, reason: routeResult.output },
          createdBy: router.id,
          createdAt: Date.now(),
        },
        {
          id: "result",
          type: "document",
          name: "Specialist Output",
          content: specResult.output,
          createdBy: selected.id,
          createdAt: Date.now(),
        },
      ],
      metrics: {
        totalTokens: routerContext.usedTokens + specContext.usedTokens,
        totalDuration: Date.now() - startTime,
        agentsSpawned: 2,
        tasksSplit: 1,
      },
    };
  },
};

// ============================================================================
// Swarm Pattern (Dynamic Spawning)
// ============================================================================

/**
 * Swarm Pattern: Spawn agents dynamically as needed
 * Orchestrator decides when to spawn new agents based on task requirements.
 */
export const swarmPattern: PatternExecutor = {
  name: "swarm",
  description: "Dynamically spawn agents based on task decomposition",

  async execute(task, agents, executor) {
    const startTime = Date.now();
    const maxSpawn = task.maxAgents;

    // Use first agent as coordinator
    const coordinator = agents[0];
    const available = agents.slice(1);

    const mainContext = createContext({ maxTokens: 200000 });
    addMessage(mainContext, "system", `You are a swarm coordinator.
Analyze the task and determine what sub-agents are needed.
Available agent types: ${available.map(a => a.name).join(", ")}
Max agents: ${maxSpawn}`);

    const input = String(task.input);
    addMessage(mainContext, "user", input);

    // Get spawning decisions
    const planResult = await executor(coordinator, input, mainContext);

    // For now, use available agents in parallel
    // In production, would dynamically spawn based on plan
    const spawnedAgents = available.slice(0, maxSpawn - 1);

    const workerResults = await Promise.all(
      spawnedAgents.map(async (agent) => {
        const workerCtx = createChildContext(mainContext);
        const result = await executor(agent, input, workerCtx);
        return { agent, result, tokens: workerCtx.usedTokens };
      })
    );

    const successful = workerResults.filter(r => r.result.success);
    const totalTokens = mainContext.usedTokens + workerResults.reduce((s, r) => s + r.tokens, 0);

    // Synthesize
    const synthPrompt = `Synthesize these results:\n${successful.map(r => `[${r.agent.name}]: ${r.result.output}`).join("\n\n")}`;
    const synthResult = await executor(coordinator, synthPrompt, mainContext);

    return {
      success: synthResult.success,
      output: synthResult.output,
      summary: `Swarm spawned ${spawnedAgents.length} agents`,
      artifacts: workerResults.map((r, i) => ({
        id: `swarm-${i}`,
        type: "analysis" as const,
        name: `${r.agent.name} output`,
        content: r.result.output,
        createdBy: r.agent.id,
        createdAt: Date.now(),
      })),
      metrics: {
        totalTokens,
        totalDuration: Date.now() - startTime,
        agentsSpawned: 1 + spawnedAgents.length,
        tasksSplit: spawnedAgents.length,
      },
    };
  },
};

// ============================================================================
// Pattern Registry
// ============================================================================

export const PATTERNS: Record<OrchestrationPattern, PatternExecutor> = {
  snake: snakePattern,
  parallel: parallelPattern,
  hierarchical: hierarchicalPattern,
  evaluator: evaluatorPattern,
  router: routerPattern,
  swarm: swarmPattern,
};

/**
 * Get pattern executor by name
 */
export function getPattern(name: OrchestrationPattern): PatternExecutor {
  return PATTERNS[name];
}

/**
 * Select best pattern for task
 */
export function selectPattern(task: Task): OrchestrationPattern {
  // If explicitly specified, use that
  if (task.pattern) return task.pattern;

  // Otherwise, infer from task characteristics
  const desc = task.description.toLowerCase();

  if (/step.*by.*step|sequenc|chain|pipeline/i.test(desc)) {
    return "snake";
  }

  if (/parallel|concurrent|simultaneous|all.*at.*once/i.test(desc)) {
    return "parallel";
  }

  if (/coordinat|delegat|break.*down|complex/i.test(desc)) {
    return "hierarchical";
  }

  if (/review|evaluat|improv|refin|iterate/i.test(desc)) {
    return "evaluator";
  }

  if (/classif|route|direct|select/i.test(desc)) {
    return "router";
  }

  // Default to hierarchical for complex tasks
  if (task.maxAgents > 3) {
    return "hierarchical";
  }

  return "snake";
}
