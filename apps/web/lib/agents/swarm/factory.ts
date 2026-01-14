/**
 * Agent Factory
 *
 * Auto-generates agents from simple human prompts.
 * Analyzes intent and creates appropriate agent configurations.
 */

import type {
  SubAgent,
  Wizard,
  AgentRole,
  Priority,
  TriggerCondition,
  GenerateAgentRequest,
  AgentTemplate,
  WizardExample,
} from "./types";

// ============================================================================
// Agent Templates
// ============================================================================

const TEMPLATES: Record<string, AgentTemplate> = {
  analyzer: {
    name: "Analyzer",
    role: "worker",
    basePrompt: `You are an analytical agent. Your job is to examine inputs carefully, identify patterns, extract key information, and provide structured analysis.

Guidelines:
- Be thorough but concise
- Cite specific evidence for conclusions
- Highlight uncertainties
- Suggest areas needing further investigation`,
    capabilities: ["analyze", "extract", "summarize", "compare"],
    tools: ["read", "search", "grep"],
    constraints: ["Do not make changes", "Do not execute code", "Report findings only"],
  },

  generator: {
    name: "Generator",
    role: "worker",
    basePrompt: `You are a generative agent. Your job is to create content based on specifications, following best practices and maintaining consistency.

Guidelines:
- Follow all style guidelines
- Generate complete, working outputs
- Include comments/documentation
- Validate against requirements`,
    capabilities: ["generate", "create", "write", "compose"],
    tools: ["write", "edit", "format"],
    constraints: ["Follow specifications exactly", "Request clarification if ambiguous"],
  },

  reviewer: {
    name: "Reviewer",
    role: "evaluator",
    basePrompt: `You are a review agent. Your job is to evaluate outputs against criteria, identify issues, and provide actionable feedback.

Guidelines:
- Check against all criteria
- Prioritize issues by severity
- Provide specific fix suggestions
- Acknowledge what works well`,
    capabilities: ["evaluate", "review", "validate", "critique"],
    tools: ["read", "compare", "lint"],
    constraints: ["Be constructive", "Provide evidence for issues"],
  },

  router: {
    name: "Router",
    role: "router",
    basePrompt: `You are a routing agent. Your job is to analyze requests and determine the best handling path.

Guidelines:
- Identify the core intent
- Match to available capabilities
- Consider request complexity
- Route efficiently`,
    capabilities: ["classify", "route", "triage", "delegate"],
    tools: [],
    constraints: ["Do not execute tasks", "Route only"],
  },

  orchestrator: {
    name: "Orchestrator",
    role: "orchestrator",
    basePrompt: `You are an orchestration agent. Your job is to coordinate other agents, break down complex tasks, and synthesize results.

Guidelines:
- Decompose tasks effectively
- Assign to appropriate agents
- Track progress
- Synthesize results coherently`,
    capabilities: ["coordinate", "plan", "synthesize", "manage"],
    tools: ["spawn", "delegate", "aggregate"],
    constraints: ["Minimize agent spawning", "Prefer simple solutions"],
  },
};

// ============================================================================
// Intent Analysis
// ============================================================================

interface IntentAnalysis {
  primaryIntent: string;
  secondaryIntents: string[];
  requiredCapabilities: string[];
  suggestedRole: AgentRole;
  complexity: "simple" | "moderate" | "complex";
  domain?: string;
}

const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  intent: string;
  capability: string;
  role: AgentRole;
}> = [
  // Analysis intents
  { pattern: /analyz|examin|investigat|inspect|review/i, intent: "analyze", capability: "analyze", role: "worker" },
  { pattern: /find|search|look for|locate/i, intent: "search", capability: "search", role: "worker" },
  { pattern: /compare|diff|contrast/i, intent: "compare", capability: "compare", role: "worker" },
  { pattern: /summar|condensed|brief/i, intent: "summarize", capability: "summarize", role: "worker" },

  // Generation intents
  { pattern: /creat|generat|write|build|make/i, intent: "create", capability: "generate", role: "worker" },
  { pattern: /refactor|improve|optimi/i, intent: "refactor", capability: "transform", role: "worker" },
  { pattern: /fix|repair|correct|debug/i, intent: "fix", capability: "fix", role: "worker" },
  { pattern: /document|explain|describe/i, intent: "document", capability: "document", role: "worker" },

  // Evaluation intents
  { pattern: /check|validat|verify|test/i, intent: "validate", capability: "validate", role: "evaluator" },
  { pattern: /review|critique|assess|evaluat/i, intent: "evaluate", capability: "evaluate", role: "evaluator" },
  { pattern: /audit|compliance|security/i, intent: "audit", capability: "audit", role: "evaluator" },

  // Orchestration intents
  { pattern: /plan|design|architect/i, intent: "plan", capability: "plan", role: "orchestrator" },
  { pattern: /coordinat|manag|orchestrat/i, intent: "coordinate", capability: "coordinate", role: "orchestrator" },
  { pattern: /break.*down|decompos|split/i, intent: "decompose", capability: "decompose", role: "orchestrator" },
];

const DOMAIN_PATTERNS: Array<{ pattern: RegExp; domain: string }> = [
  { pattern: /react|vue|angular|frontend|component|ui/i, domain: "frontend" },
  { pattern: /api|backend|server|endpoint|database/i, domain: "backend" },
  { pattern: /test|spec|coverage|jest|vitest/i, domain: "testing" },
  { pattern: /secur|auth|permission|encrypt/i, domain: "security" },
  { pattern: /perform|speed|optimi|cache/i, domain: "performance" },
  { pattern: /deploy|ci|cd|docker|kubernetes/i, domain: "devops" },
  { pattern: /style|css|tailwind|design/i, domain: "styling" },
  { pattern: /typescript|type|interface|schema/i, domain: "types" },
];

/**
 * Analyze prompt to determine intent
 */
export function analyzeIntent(prompt: string): IntentAnalysis {
  const intents: string[] = [];
  const capabilities: string[] = [];
  const roles: AgentRole[] = [];

  // Match intent patterns
  for (const { pattern, intent, capability, role } of INTENT_PATTERNS) {
    if (pattern.test(prompt)) {
      if (!intents.includes(intent)) intents.push(intent);
      if (!capabilities.includes(capability)) capabilities.push(capability);
      if (!roles.includes(role)) roles.push(role);
    }
  }

  // Detect domain
  let domain: string | undefined;
  for (const { pattern, domain: d } of DOMAIN_PATTERNS) {
    if (pattern.test(prompt)) {
      domain = d;
      break;
    }
  }

  // Determine complexity
  const wordCount = prompt.split(/\s+/).length;
  const hasMultipleIntents = intents.length > 2;
  const hasConditionals = /if|when|unless|depend/i.test(prompt);

  let complexity: IntentAnalysis["complexity"] = "simple";
  if (wordCount > 50 || hasMultipleIntents || hasConditionals) {
    complexity = "moderate";
  }
  if (wordCount > 150 || (hasMultipleIntents && hasConditionals)) {
    complexity = "complex";
  }

  // Determine primary role
  let suggestedRole: AgentRole = roles[0] || "worker";
  if (complexity === "complex") {
    suggestedRole = "orchestrator";
  }

  return {
    primaryIntent: intents[0] || "general",
    secondaryIntents: intents.slice(1),
    requiredCapabilities: capabilities.length > 0 ? capabilities : ["general"],
    suggestedRole,
    complexity,
    domain,
  };
}

// ============================================================================
// Agent Generation
// ============================================================================

let agentCounter = 0;

/**
 * Generate agent from simple prompt
 */
export function generateAgent(request: GenerateAgentRequest): SubAgent {
  const analysis = analyzeIntent(request.prompt);
  const template = selectTemplate(analysis);

  const agent: SubAgent = {
    id: `agent-${++agentCounter}-${Date.now().toString(36)}`,
    name: generateName(request.purpose, analysis),
    role: analysis.suggestedRole,
    description: request.purpose,

    capabilities: [
      ...template.capabilities,
      ...(request.capabilities || []),
      ...analysis.requiredCapabilities,
    ].filter((v, i, a) => a.indexOf(v) === i), // Unique

    tools: template.tools,

    systemPrompt: buildSystemPrompt(template, request, analysis),
    constraints: [
      ...template.constraints,
      ...(request.constraints || []),
    ],

    maxTokens: getTokenLimit(analysis.complexity),
    maxDuration: getDurationLimit(analysis.complexity),
    maxChildren: getChildLimit(analysis.suggestedRole),

    triggers: generateTriggers(request.prompt, analysis),
    priority: getPriority(analysis),
  };

  return agent;
}

/**
 * Generate a Wizard (specialized domain expert)
 */
export function generateWizard(
  request: GenerateAgentRequest & {
    domain: string;
    expertise: string[];
    examples?: WizardExample[];
  }
): Wizard {
  const baseAgent = generateAgent(request);

  const wizard: Wizard = {
    ...baseAgent,
    role: "wizard",
    domain: request.domain,
    expertise: request.expertise,
    examples: request.examples || [],
  };

  // Enhance system prompt with domain expertise
  wizard.systemPrompt = `You are a ${request.domain} expert wizard.

EXPERTISE AREAS:
${request.expertise.map(e => `- ${e}`).join("\n")}

${baseAgent.systemPrompt}

${request.examples?.length ? `
EXAMPLES OF YOUR WORK:
${request.examples.map(e => `
Input: ${e.input}
Output: ${e.output}
${e.explanation ? `Explanation: ${e.explanation}` : ""}
`).join("\n")}` : ""}`;

  return wizard;
}

// ============================================================================
// Helpers
// ============================================================================

function selectTemplate(analysis: IntentAnalysis): AgentTemplate {
  switch (analysis.suggestedRole) {
    case "orchestrator":
      return TEMPLATES.orchestrator;
    case "evaluator":
      return TEMPLATES.reviewer;
    case "router":
      return TEMPLATES.router;
    default:
      // Select worker type based on primary intent
      if (["create", "refactor", "fix", "document"].includes(analysis.primaryIntent)) {
        return TEMPLATES.generator;
      }
      return TEMPLATES.analyzer;
  }
}

function generateName(purpose: string, analysis: IntentAnalysis): string {
  const words = purpose.split(/\s+/).slice(0, 3);
  const prefix = analysis.suggestedRole.charAt(0).toUpperCase() + analysis.suggestedRole.slice(1);
  return `${prefix}:${words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")}`;
}

function buildSystemPrompt(
  template: AgentTemplate,
  request: GenerateAgentRequest,
  analysis: IntentAnalysis
): string {
  let prompt = template.basePrompt;

  prompt += `\n\nYOUR PURPOSE:\n${request.purpose}`;

  if (analysis.domain) {
    prompt += `\n\nDOMAIN: ${analysis.domain}`;
  }

  if (request.constraints?.length) {
    prompt += `\n\nADDITIONAL CONSTRAINTS:\n${request.constraints.map(c => `- ${c}`).join("\n")}`;
  }

  return prompt;
}

function generateTriggers(prompt: string, analysis: IntentAnalysis): TriggerCondition[] {
  const triggers: TriggerCondition[] = [];

  // Add keyword triggers from capabilities
  for (const cap of analysis.requiredCapabilities) {
    triggers.push({
      type: "keyword",
      value: cap,
      confidence: 0.7,
    });
  }

  // Add intent trigger
  triggers.push({
    type: "intent",
    value: analysis.primaryIntent,
    confidence: 0.8,
  });

  // Add pattern if domain detected
  if (analysis.domain) {
    const domainPattern = DOMAIN_PATTERNS.find(p => p.domain === analysis.domain);
    if (domainPattern) {
      triggers.push({
        type: "pattern",
        value: domainPattern.pattern,
        confidence: 0.6,
      });
    }
  }

  return triggers;
}

function getTokenLimit(complexity: IntentAnalysis["complexity"]): number {
  switch (complexity) {
    case "simple": return 50000;
    case "moderate": return 100000;
    case "complex": return 200000;
  }
}

function getDurationLimit(complexity: IntentAnalysis["complexity"]): number {
  switch (complexity) {
    case "simple": return 30000;      // 30s
    case "moderate": return 120000;   // 2min
    case "complex": return 300000;    // 5min
  }
}

function getChildLimit(role: AgentRole): number {
  switch (role) {
    case "orchestrator": return 10;
    case "router": return 5;
    default: return 2;
  }
}

function getPriority(analysis: IntentAnalysis): Priority {
  if (analysis.primaryIntent === "fix" || analysis.domain === "security") {
    return "high";
  }
  if (analysis.complexity === "complex") {
    return "normal";
  }
  return "normal";
}

// ============================================================================
// Template Library
// ============================================================================

/**
 * Get all available templates
 */
export function getTemplates(): AgentTemplate[] {
  return Object.values(TEMPLATES);
}

/**
 * Register custom template
 */
export function registerTemplate(name: string, template: AgentTemplate): void {
  TEMPLATES[name] = template;
}

/**
 * Generate agent from template name
 */
export function fromTemplate(
  templateName: string,
  overrides: Partial<GenerateAgentRequest> = {}
): SubAgent {
  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }

  return generateAgent({
    prompt: template.basePrompt,
    purpose: overrides.purpose || template.name,
    capabilities: overrides.capabilities,
    constraints: overrides.constraints,
  });
}
