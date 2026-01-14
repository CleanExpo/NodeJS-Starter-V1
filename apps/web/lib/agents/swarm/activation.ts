/**
 * Auto-Activation Intelligence
 *
 * Determines when, which, and how many agents to activate.
 * Analyzes prompts and decides optimal orchestration strategy.
 */

import type {
  SubAgent,
  Task,
  OrchestrationPattern,
  OrchestrationPlan,
  PlanStep,
  Priority,
} from "./types";
import { analyzeIntent } from "./factory";
import { selectPattern } from "./patterns";
import { recommendWizards, selectWizard } from "./wizards";

// ============================================================================
// Activation Decision Types
// ============================================================================

export interface ActivationDecision {
  shouldActivate: boolean;
  reason: string;
  confidence: number;  // 0-1

  // What to activate
  pattern: OrchestrationPattern;
  agentCount: number;
  wizardsNeeded: string[];

  // How to orchestrate
  plan: OrchestrationPlan;

  // Resource estimates
  estimatedTokens: number;
  estimatedDuration: number;
}

export interface ComplexityAnalysis {
  score: number;  // 0-100
  level: "trivial" | "simple" | "moderate" | "complex" | "expert";
  factors: ComplexityFactor[];
}

interface ComplexityFactor {
  name: string;
  weight: number;
  detected: boolean;
}

// ============================================================================
// Complexity Analysis
// ============================================================================

const COMPLEXITY_FACTORS: ComplexityFactor[] = [
  // Task scope factors
  { name: "multiple-files", weight: 15, detected: false },
  { name: "cross-domain", weight: 20, detected: false },
  { name: "multi-step", weight: 15, detected: false },
  { name: "conditional-logic", weight: 10, detected: false },

  // Technical depth factors
  { name: "requires-analysis", weight: 10, detected: false },
  { name: "requires-generation", weight: 10, detected: false },
  { name: "requires-review", weight: 10, detected: false },
  { name: "requires-testing", weight: 15, detected: false },

  // Risk factors
  { name: "security-sensitive", weight: 20, detected: false },
  { name: "data-migration", weight: 25, detected: false },
  { name: "breaking-changes", weight: 20, detected: false },
  { name: "production-impact", weight: 25, detected: false },
];

const COMPLEXITY_PATTERNS: Array<{
  pattern: RegExp;
  factors: string[];
}> = [
  { pattern: /multiple|several|all|every|across/i, factors: ["multiple-files"] },
  { pattern: /and|then|after|before|while/i, factors: ["multi-step"] },
  { pattern: /if|when|unless|depend|condition/i, factors: ["conditional-logic"] },
  { pattern: /frontend.*backend|api.*ui|database.*component/i, factors: ["cross-domain"] },
  { pattern: /analyz|review|audit|check|investigat/i, factors: ["requires-analysis"] },
  { pattern: /create|generate|write|build|implement/i, factors: ["requires-generation"] },
  { pattern: /review|critique|evaluat|assess/i, factors: ["requires-review"] },
  { pattern: /test|spec|coverage|verify/i, factors: ["requires-testing"] },
  { pattern: /auth|secur|permission|encrypt|password/i, factors: ["security-sensitive"] },
  { pattern: /migrat|transfer|convert|upgrade/i, factors: ["data-migration"] },
  { pattern: /breaking|deprecat|remove|replace/i, factors: ["breaking-changes"] },
  { pattern: /production|live|deploy|release/i, factors: ["production-impact"] },
];

/**
 * Analyze task complexity
 */
export function analyzeComplexity(prompt: string): ComplexityAnalysis {
  const factors = COMPLEXITY_FACTORS.map(f => ({ ...f, detected: false }));
  let score = 0;

  // Check each pattern
  for (const { pattern, factors: factorNames } of COMPLEXITY_PATTERNS) {
    if (pattern.test(prompt)) {
      for (const name of factorNames) {
        const factor = factors.find(f => f.name === name);
        if (factor && !factor.detected) {
          factor.detected = true;
          score += factor.weight;
        }
      }
    }
  }

  // Word count contributes to complexity
  const wordCount = prompt.split(/\s+/).length;
  if (wordCount > 100) score += 10;
  if (wordCount > 200) score += 10;

  // Normalize score to 0-100
  score = Math.min(100, score);

  // Determine level
  let level: ComplexityAnalysis["level"];
  if (score < 15) level = "trivial";
  else if (score < 30) level = "simple";
  else if (score < 50) level = "moderate";
  else if (score < 75) level = "complex";
  else level = "expert";

  return {
    score,
    level,
    factors: factors.filter(f => f.detected),
  };
}

// ============================================================================
// Activation Decision
// ============================================================================

/**
 * Decide whether to activate sub-agents and how
 */
export function decideActivation(prompt: string): ActivationDecision {
  const complexity = analyzeComplexity(prompt);
  const intent = analyzeIntent(prompt);
  const wizards = recommendWizards(prompt, 3);

  // Determine if we should activate sub-agents
  const shouldActivate = complexity.score >= 25 || wizards.length >= 2;

  // Confidence based on complexity clarity
  const confidence = complexity.factors.length > 0
    ? Math.min(0.9, 0.5 + (complexity.factors.length * 0.1))
    : 0.5;

  // Determine pattern
  const pattern = selectPatternForComplexity(complexity, intent.primaryIntent);

  // Determine agent count
  const agentCount = calculateAgentCount(complexity, pattern);

  // Build plan
  const plan = buildPlan(prompt, complexity, pattern, agentCount, wizards);

  // Estimate resources
  const estimatedTokens = estimateTokens(complexity, agentCount);
  const estimatedDuration = estimateDuration(complexity, agentCount);

  const reason = shouldActivate
    ? `Task complexity ${complexity.level} (${complexity.score}/100) suggests sub-agent orchestration with ${pattern} pattern`
    : `Task is ${complexity.level}, single agent sufficient`;

  return {
    shouldActivate,
    reason,
    confidence,
    pattern,
    agentCount,
    wizardsNeeded: wizards.map(w => w.domain),
    plan,
    estimatedTokens,
    estimatedDuration,
  };
}

/**
 * Quick check if task needs sub-agents
 */
export function needsSubAgents(prompt: string): boolean {
  const complexity = analyzeComplexity(prompt);
  return complexity.score >= 30;
}

/**
 * Get activation recommendation
 */
export function getActivationRecommendation(prompt: string): {
  recommended: boolean;
  pattern: OrchestrationPattern;
  agentCount: number;
  reasoning: string;
} {
  const decision = decideActivation(prompt);

  return {
    recommended: decision.shouldActivate,
    pattern: decision.pattern,
    agentCount: decision.agentCount,
    reasoning: decision.reason,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function selectPatternForComplexity(
  complexity: ComplexityAnalysis,
  intent: string
): OrchestrationPattern {
  // Expert level always needs hierarchical orchestration
  if (complexity.level === "expert") {
    return "hierarchical";
  }

  // Complex tasks benefit from swarm (dynamic spawning)
  if (complexity.level === "complex") {
    return "swarm";
  }

  // Multi-step tasks use snake (sequential)
  if (complexity.factors.some(f => f.name === "multi-step")) {
    return "snake";
  }

  // Tasks requiring multiple types of work use parallel
  const requiresMultiple = ["requires-analysis", "requires-generation", "requires-review"]
    .filter(name => complexity.factors.some(f => f.name === name))
    .length >= 2;

  if (requiresMultiple) {
    return "parallel";
  }

  // Review/evaluation tasks use evaluator pattern
  if (complexity.factors.some(f => f.name === "requires-review")) {
    return "evaluator";
  }

  // Default to snake for moderate tasks
  if (complexity.level === "moderate") {
    return "snake";
  }

  // Simple tasks don't need complex orchestration
  return "snake";
}

function calculateAgentCount(
  complexity: ComplexityAnalysis,
  pattern: OrchestrationPattern
): number {
  // Base count from complexity
  let count: number;

  switch (complexity.level) {
    case "trivial":
    case "simple":
      count = 1;
      break;
    case "moderate":
      count = 2;
      break;
    case "complex":
      count = 4;
      break;
    case "expert":
      count = 6;
      break;
  }

  // Adjust for pattern
  switch (pattern) {
    case "evaluator":
      count = Math.max(2, count);  // Need at least 2 for eval
      break;
    case "hierarchical":
      count = Math.max(3, count);  // Orchestrator + 2 workers minimum
      break;
    case "parallel":
      count = Math.min(5, count);  // Cap parallel agents
      break;
    case "swarm":
      count = Math.max(4, count);  // Swarm needs room to grow
      break;
  }

  return count;
}

function buildPlan(
  prompt: string,
  complexity: ComplexityAnalysis,
  pattern: OrchestrationPattern,
  agentCount: number,
  wizards: Array<{ domain: string; name: string }>
): OrchestrationPlan {
  const steps: PlanStep[] = [];
  let stepOrder = 0;

  // Generate steps based on pattern
  switch (pattern) {
    case "snake":
      // Sequential steps
      for (let i = 0; i < agentCount; i++) {
        steps.push({
          id: `step-${i}`,
          order: stepOrder++,
          agentType: i === 0 ? "orchestrator" : "worker",
          description: getStepDescription(complexity.factors[i]?.name || "process"),
          input: i === 0 ? prompt : "previous step output",
          dependencies: i > 0 ? [`step-${i - 1}`] : [],
          parallel: false,
        });
      }
      break;

    case "parallel":
      // All parallel
      for (let i = 0; i < agentCount; i++) {
        steps.push({
          id: `step-${i}`,
          order: 0,  // All same order = parallel
          agentType: "worker",
          agentId: wizards[i]?.domain,
          description: wizards[i]?.name || `Worker ${i + 1}`,
          input: prompt,
          dependencies: [],
          parallel: true,
        });
      }
      // Add aggregation step
      steps.push({
        id: "aggregate",
        order: 1,
        agentType: "orchestrator",
        description: "Aggregate results",
        input: "all worker outputs",
        dependencies: steps.map(s => s.id),
        parallel: false,
      });
      break;

    case "hierarchical":
      // Orchestrator first
      steps.push({
        id: "plan",
        order: 0,
        agentType: "orchestrator",
        description: "Break down task and plan",
        input: prompt,
        dependencies: [],
        parallel: false,
      });
      // Workers in parallel
      for (let i = 1; i < agentCount - 1; i++) {
        steps.push({
          id: `worker-${i}`,
          order: 1,
          agentType: "worker",
          agentId: wizards[i - 1]?.domain,
          description: `Execute subtask ${i}`,
          input: "orchestrator plan",
          dependencies: ["plan"],
          parallel: true,
        });
      }
      // Synthesis
      steps.push({
        id: "synthesize",
        order: 2,
        agentType: "orchestrator",
        description: "Synthesize worker results",
        input: "all worker outputs",
        dependencies: steps.filter(s => s.id.startsWith("worker")).map(s => s.id),
        parallel: false,
      });
      break;

    case "evaluator":
      steps.push({
        id: "generate",
        order: 0,
        agentType: "worker",
        description: "Generate initial output",
        input: prompt,
        dependencies: [],
        parallel: false,
      });
      steps.push({
        id: "evaluate",
        order: 1,
        agentType: "evaluator",
        description: "Evaluate output quality",
        input: "generated output",
        dependencies: ["generate"],
        parallel: false,
      });
      steps.push({
        id: "refine",
        order: 2,
        agentType: "worker",
        description: "Refine based on feedback",
        input: "evaluation feedback",
        dependencies: ["evaluate"],
        parallel: false,
      });
      break;

    default:
      steps.push({
        id: "main",
        order: 0,
        agentType: "worker",
        description: "Execute task",
        input: prompt,
        dependencies: [],
        parallel: false,
      });
  }

  return {
    id: `plan-${Date.now().toString(36)}`,
    originalPrompt: prompt,
    intent: complexity.factors[0]?.name || "general",
    complexity: complexity.level,
    requiredCapabilities: complexity.factors.map(f => f.name),
    pattern,
    steps,
    estimatedAgents: agentCount,
    estimatedTokens: estimateTokens(complexity, agentCount),
    estimatedDuration: estimateDuration(complexity, agentCount),
    needsApproval: complexity.level === "expert" || complexity.factors.some(f =>
      ["security-sensitive", "production-impact", "breaking-changes"].includes(f.name)
    ),
    approvalReason: complexity.factors.some(f => f.name === "production-impact")
      ? "Task may impact production"
      : complexity.factors.some(f => f.name === "security-sensitive")
      ? "Task involves security-sensitive operations"
      : undefined,
  };
}

function getStepDescription(factorName: string): string {
  const descriptions: Record<string, string> = {
    "requires-analysis": "Analyze and understand requirements",
    "requires-generation": "Generate implementation",
    "requires-review": "Review and validate",
    "requires-testing": "Create and run tests",
    "security-sensitive": "Security review",
    "multiple-files": "Process multiple files",
    "cross-domain": "Handle cross-domain concerns",
    default: "Process task",
  };
  return descriptions[factorName] || descriptions.default;
}

function estimateTokens(complexity: ComplexityAnalysis, agentCount: number): number {
  const baseTokens: Record<ComplexityAnalysis["level"], number> = {
    trivial: 10000,
    simple: 25000,
    moderate: 50000,
    complex: 100000,
    expert: 200000,
  };
  return baseTokens[complexity.level] * agentCount;
}

function estimateDuration(complexity: ComplexityAnalysis, agentCount: number): number {
  const baseDuration: Record<ComplexityAnalysis["level"], number> = {
    trivial: 5000,      // 5s
    simple: 15000,      // 15s
    moderate: 45000,    // 45s
    complex: 120000,    // 2min
    expert: 300000,     // 5min
  };
  // Parallel patterns are faster, sequential are slower
  const multiplier = agentCount > 2 ? 1.5 : 1;
  return baseDuration[complexity.level] * multiplier;
}
