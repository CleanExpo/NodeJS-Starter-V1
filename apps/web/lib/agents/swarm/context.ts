/**
 * Context Manager
 *
 * Manages isolated context windows for sub-agents.
 * Each agent gets its own context that doesn't pollute the parent.
 * Only summaries flow back up the chain.
 */

import type {
  AgentContext,
  ContextMessage,
  ContextSummary,
  Artifact,
} from "./types";

// ============================================================================
// Context Factory
// ============================================================================

let contextCounter = 0;

/**
 * Create a new isolated context for a sub-agent
 */
export function createContext(opts: {
  parentId?: string | null;
  maxTokens?: number;
  expiresIn?: number;
}): AgentContext {
  const now = Date.now();

  return {
    id: `ctx-${++contextCounter}-${now.toString(36)}`,
    parentId: opts.parentId ?? null,
    depth: 0,
    maxTokens: opts.maxTokens ?? 100000,
    usedTokens: 0,
    messages: [],
    memory: new Map(),
    artifacts: [],
    createdAt: now,
    lastActiveAt: now,
    expiresAt: opts.expiresIn ? now + opts.expiresIn : null,
  };
}

/**
 * Create child context inheriting from parent
 */
export function createChildContext(
  parent: AgentContext,
  opts: { maxTokens?: number; inherit?: boolean } = {}
): AgentContext {
  const child = createContext({
    parentId: parent.id,
    maxTokens: opts.maxTokens ?? Math.floor(parent.maxTokens / 2),
  });

  child.depth = parent.depth + 1;

  // Optionally inherit relevant context
  if (opts.inherit) {
    // Copy system messages
    const systemMsgs = parent.messages.filter(m => m.role === "system");
    child.messages.push(...systemMsgs);

    // Copy memory keys prefixed with "shared:"
    for (const [key, value] of parent.memory) {
      if (key.startsWith("shared:")) {
        child.memory.set(key, value);
      }
    }
  }

  return child;
}

// ============================================================================
// Context Operations
// ============================================================================

/**
 * Add message to context
 */
export function addMessage(
  ctx: AgentContext,
  role: ContextMessage["role"],
  content: string
): void {
  const tokens = estimateTokens(content);

  ctx.messages.push({
    role,
    content,
    timestamp: Date.now(),
    tokens,
  });

  ctx.usedTokens += tokens;
  ctx.lastActiveAt = Date.now();
}

/**
 * Add artifact to context
 */
export function addArtifact(
  ctx: AgentContext,
  artifact: Omit<Artifact, "id" | "createdAt">
): Artifact {
  const full: Artifact = {
    ...artifact,
    id: `art-${ctx.artifacts.length + 1}-${Date.now().toString(36)}`,
    createdAt: Date.now(),
  };

  ctx.artifacts.push(full);
  return full;
}

/**
 * Set memory value
 */
export function setMemory(ctx: AgentContext, key: string, value: unknown): void {
  ctx.memory.set(key, value);
}

/**
 * Get memory value
 */
export function getMemory<T>(ctx: AgentContext, key: string): T | undefined {
  return ctx.memory.get(key) as T | undefined;
}

/**
 * Check if context has capacity
 */
export function hasCapacity(ctx: AgentContext, requiredTokens: number): boolean {
  return ctx.usedTokens + requiredTokens <= ctx.maxTokens;
}

/**
 * Check if context is expired
 */
export function isExpired(ctx: AgentContext): boolean {
  if (!ctx.expiresAt) return false;
  return Date.now() > ctx.expiresAt;
}

// ============================================================================
// Context Summarization
// ============================================================================

/**
 * Generate summary for parent orchestrator
 * This is what gets sent back - not the full context
 */
export function summarizeContext(
  ctx: AgentContext,
  opts: {
    taskDescription: string;
    result: ContextSummary["result"];
    keyFindings: string[];
    recommendations?: string[];
  }
): ContextSummary {
  return {
    agentId: ctx.id,
    taskDescription: opts.taskDescription,
    result: opts.result,
    keyFindings: opts.keyFindings,
    artifacts: ctx.artifacts.map(a => a.id),
    recommendations: opts.recommendations ?? [],
    tokensUsed: ctx.usedTokens,
  };
}

/**
 * Compress context by removing old messages
 */
export function compressContext(ctx: AgentContext, keepLast: number = 10): void {
  if (ctx.messages.length <= keepLast) return;

  // Keep system messages and last N messages
  const system = ctx.messages.filter(m => m.role === "system");
  const recent = ctx.messages.slice(-keepLast);

  // Create summary of removed messages
  const removed = ctx.messages.slice(system.length, -keepLast);
  const removedTokens = removed.reduce((sum, m) => sum + (m.tokens ?? 0), 0);

  // Add compression summary
  const summary: ContextMessage = {
    role: "system",
    content: `[Context compressed: ${removed.length} messages (${removedTokens} tokens) summarized]`,
    timestamp: Date.now(),
    tokens: 20,
  };

  ctx.messages = [...system, summary, ...recent];
  ctx.usedTokens = ctx.messages.reduce((sum, m) => sum + (m.tokens ?? 0), 0);
}

/**
 * Extract key information from context for handoff
 */
export function extractForHandoff(ctx: AgentContext): {
  summary: string;
  keyFacts: string[];
  artifacts: Artifact[];
  memory: Record<string, unknown>;
} {
  // Get last assistant message as summary
  const lastAssistant = ctx.messages
    .filter(m => m.role === "assistant")
    .pop();

  // Extract key facts from memory
  const keyFacts: string[] = [];
  for (const [key, value] of ctx.memory) {
    if (key.startsWith("fact:")) {
      keyFacts.push(String(value));
    }
  }

  // Get shared memory
  const sharedMemory: Record<string, unknown> = {};
  for (const [key, value] of ctx.memory) {
    if (key.startsWith("shared:")) {
      sharedMemory[key.replace("shared:", "")] = value;
    }
  }

  return {
    summary: lastAssistant?.content ?? "No summary available",
    keyFacts,
    artifacts: ctx.artifacts,
    memory: sharedMemory,
  };
}

// ============================================================================
// Context Window Management
// ============================================================================

/**
 * Build prompt with context window management
 */
export function buildPrompt(
  ctx: AgentContext,
  newUserMessage: string,
  opts: {
    maxContextTokens?: number;
    includeArtifacts?: boolean;
  } = {}
): string {
  const maxTokens = opts.maxContextTokens ?? ctx.maxTokens * 0.8;
  const parts: string[] = [];

  // Add system messages first
  const systemMsgs = ctx.messages.filter(m => m.role === "system");
  for (const msg of systemMsgs) {
    parts.push(`[System] ${msg.content}`);
  }

  // Add relevant memory
  const relevantMemory: string[] = [];
  for (const [key, value] of ctx.memory) {
    if (key.startsWith("context:")) {
      relevantMemory.push(`${key.replace("context:", "")}: ${value}`);
    }
  }
  if (relevantMemory.length > 0) {
    parts.push(`\n[Context]\n${relevantMemory.join("\n")}`);
  }

  // Add conversation history (most recent first, then trim)
  const history = ctx.messages.filter(m => m.role !== "system");
  let historyTokens = 0;
  const includedHistory: ContextMessage[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const tokens = msg.tokens ?? estimateTokens(msg.content);
    if (historyTokens + tokens > maxTokens * 0.5) break;
    includedHistory.unshift(msg);
    historyTokens += tokens;
  }

  for (const msg of includedHistory) {
    const prefix = msg.role === "user" ? "User" : msg.role === "assistant" ? "Assistant" : "Tool";
    parts.push(`\n[${prefix}] ${msg.content}`);
  }

  // Add artifacts if requested
  if (opts.includeArtifacts && ctx.artifacts.length > 0) {
    parts.push("\n[Artifacts]");
    for (const art of ctx.artifacts.slice(-5)) {
      parts.push(`- ${art.name} (${art.type}): ${typeof art.content === "string" ? art.content.slice(0, 100) : "[object]"}`);
    }
  }

  // Add new user message
  parts.push(`\n[User] ${newUserMessage}`);

  return parts.join("\n");
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

/**
 * Format context for debugging
 */
export function formatContext(ctx: AgentContext): string {
  return `
Context ${ctx.id}
├── Parent: ${ctx.parentId ?? "none"}
├── Depth: ${ctx.depth}
├── Tokens: ${ctx.usedTokens}/${ctx.maxTokens}
├── Messages: ${ctx.messages.length}
├── Artifacts: ${ctx.artifacts.length}
├── Memory Keys: ${ctx.memory.size}
└── Age: ${Math.round((Date.now() - ctx.createdAt) / 1000)}s
`.trim();
}
