/**
 * SDK Agent Registry and Auto-Deployment Router
 *
 * Automatically routes user requests to the appropriate SDK agent
 * based on keywords, context, and available credentials.
 *
 * Features:
 * - Keyword-based agent selection
 * - Credential availability checking
 * - Fallback and error handling
 * - Agent chaining for complex tasks
 */

import type { AgentLike } from "../core";
import type { SDKContext, SDKAgentType, SDKAgentInfo } from "./types";

import { stripeAgent, stripeAgentInfo } from "./stripe-agent";
import { vercelAgent, vercelAgentInfo } from "./vercel-agent";
import { githubAgent, githubAgentInfo } from "./github-agent";
import { dockerAgent, dockerAgentInfo } from "./docker-agent";
import { supabaseAgent, supabaseAgentInfo } from "./supabase-agent";
import { geminiAgent, geminiAgentInfo } from "./gemini-agent";

// ============================================================================
// Agent Registry
// ============================================================================

interface RegisteredAgent {
  agent: AgentLike<SDKContext, string>;
  info: SDKAgentInfo;
}

const agentRegistry = new Map<SDKAgentType, RegisteredAgent>([
  ["stripe", { agent: stripeAgent, info: stripeAgentInfo }],
  ["vercel", { agent: vercelAgent, info: vercelAgentInfo }],
  ["github", { agent: githubAgent, info: githubAgentInfo }],
  ["docker", { agent: dockerAgent, info: dockerAgentInfo }],
  ["supabase", { agent: supabaseAgent, info: supabaseAgentInfo }],
  ["gemini", { agent: geminiAgent, info: geminiAgentInfo }],
]);

// ============================================================================
// Registry Functions
// ============================================================================

/**
 * Get all registered agents
 */
export function getAllAgents(): RegisteredAgent[] {
  return Array.from(agentRegistry.values());
}

/**
 * Get agent by type
 */
export function getAgent(type: SDKAgentType): RegisteredAgent | undefined {
  return agentRegistry.get(type);
}

/**
 * Get agent info by type
 */
export function getAgentInfo(type: SDKAgentType): SDKAgentInfo | undefined {
  return agentRegistry.get(type)?.info;
}

/**
 * Check if credentials are available for an agent
 */
export function hasCredentials(ctx: SDKContext, type: SDKAgentType): boolean {
  const info = getAgentInfo(type);
  if (!info) return false;

  const creds = ctx.credentials[type];
  if (!creds) return info.requiredCredentials.length === 0;

  return info.requiredCredentials.every(
    (key) => key in creds && !!(creds as Record<string, unknown>)[key]
  );
}

/**
 * Get available agents (those with credentials)
 */
export function getAvailableAgents(ctx: SDKContext): RegisteredAgent[] {
  return getAllAgents().filter((ra) => hasCredentials(ctx, ra.info.type));
}

// ============================================================================
// Auto-Router
// ============================================================================

interface RouterMatch {
  agent: RegisteredAgent;
  score: number;
  matchedKeywords: string[];
  hasCredentials: boolean;
}

/**
 * Route an input to the best matching agent
 */
export function routeToAgent(
  input: string,
  ctx: SDKContext
): RouterMatch | null {
  const lowerInput = input.toLowerCase();
  const matches: RouterMatch[] = [];

  for (const registered of getAllAgents()) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Check each keyword
    for (const keyword of registered.info.keywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);

        // Boost for exact word match
        const wordPattern = new RegExp(`\\b${keyword}\\b`, "i");
        if (wordPattern.test(input)) {
          score += 0.5;
        }
      }
    }

    // Check agent name
    if (lowerInput.includes(registered.info.name.toLowerCase())) {
      score += 2;
      matchedKeywords.push(registered.info.name);
    }

    if (score > 0) {
      matches.push({
        agent: registered,
        score,
        matchedKeywords,
        hasCredentials: hasCredentials(ctx, registered.info.type),
      });
    }
  }

  if (matches.length === 0) return null;

  // Sort by score (descending), prefer agents with credentials
  matches.sort((a, b) => {
    // Prefer agents with credentials
    if (a.hasCredentials && !b.hasCredentials) return -1;
    if (!a.hasCredentials && b.hasCredentials) return 1;
    // Then by score
    return b.score - a.score;
  });

  return matches[0];
}

/**
 * Get all matching agents for an input (for complex tasks)
 */
export function routeToAgents(
  input: string,
  ctx: SDKContext,
  limit = 3
): RouterMatch[] {
  const lowerInput = input.toLowerCase();
  const matches: RouterMatch[] = [];

  for (const registered of getAllAgents()) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of registered.info.keywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    if (lowerInput.includes(registered.info.name.toLowerCase())) {
      score += 2;
      matchedKeywords.push(registered.info.name);
    }

    if (score > 0) {
      matches.push({
        agent: registered,
        score,
        matchedKeywords,
        hasCredentials: hasCredentials(ctx, registered.info.type),
      });
    }
  }

  return matches
    .sort((a, b) => {
      if (a.hasCredentials && !b.hasCredentials) return -1;
      if (!a.hasCredentials && b.hasCredentials) return 1;
      return b.score - a.score;
    })
    .slice(0, limit);
}

// ============================================================================
// SDK Router Agent
// ============================================================================

import { Agent, tool, agentAsTool } from "../core";
import { z } from "zod";

/**
 * Tool to list available SDK agents
 */
export const listSDKAgentsTool = tool<
  z.ZodObject<{ onlyAvailable: z.ZodOptional<z.ZodBoolean> }>,
  { agents: Array<{ type: string; name: string; description: string; available: boolean }> },
  SDKContext
>({
  name: "list_sdk_agents",
  description: "List available SDK integration agents",
  parameters: z.object({
    onlyAvailable: z.boolean().optional().describe("Only show agents with credentials"),
  }),
  execute: ({ onlyAvailable = false }, ctx) => {
    const all = getAllAgents();
    const agents = all
      .filter((ra) => !onlyAvailable || hasCredentials(ctx.context, ra.info.type))
      .map((ra) => ({
        type: ra.info.type,
        name: ra.info.name,
        description: ra.info.description,
        available: hasCredentials(ctx.context, ra.info.type),
      }));

    return { agents };
  },
});

/**
 * Tool to route to a specific SDK agent
 */
export const routeToSDKAgentTool = tool<
  z.ZodObject<{
    agentType: z.ZodEnum<["stripe", "vercel", "github", "docker", "supabase", "gemini"]>;
    input: z.ZodString;
  }>,
  { agentName: string; output: unknown },
  SDKContext
>({
  name: "route_to_sdk_agent",
  description: "Route a request to a specific SDK agent",
  parameters: z.object({
    agentType: z.enum(["stripe", "vercel", "github", "docker", "supabase", "gemini"]),
    input: z.string().describe("Input to send to the agent"),
  }),
  execute: async ({ agentType, input }, ctx) => {
    const registered = getAgent(agentType);
    if (!registered) {
      throw new Error(`Agent ${agentType} not found`);
    }

    if (!hasCredentials(ctx.context, agentType)) {
      throw new Error(`Missing credentials for ${agentType} agent`);
    }

    const result = await registered.agent.run(input, ctx.context);
    return {
      agentName: registered.info.name,
      output: result.finalOutput,
    };
  },
});

/**
 * Auto-route tool that intelligently selects the best agent
 */
export const autoRouteTool = tool<
  z.ZodObject<{ input: z.ZodString }>,
  { agentName: string; output: unknown; matchedKeywords: string[] },
  SDKContext
>({
  name: "auto_route",
  description: "Automatically route to the best SDK agent based on the input",
  parameters: z.object({
    input: z.string().describe("User input to route"),
  }),
  execute: async ({ input }, ctx) => {
    const match = routeToAgent(input, ctx.context);

    if (!match) {
      throw new Error("No matching agent found for this request");
    }

    if (!match.hasCredentials) {
      throw new Error(
        `Best match is ${match.agent.info.name} but credentials are not configured`
      );
    }

    const result = await match.agent.agent.run(input, ctx.context);
    return {
      agentName: match.agent.info.name,
      output: result.finalOutput,
      matchedKeywords: match.matchedKeywords,
    };
  },
});

/**
 * SDK Router Agent - orchestrates all SDK agents
 */
export const sdkRouterAgent = Agent.create<SDKContext, string>({
  name: "SDKRouter",
  instructions: (ctx) => {
    const available = getAvailableAgents(ctx);
    const unavailable = getAllAgents().filter(
      (ra) => !hasCredentials(ctx, ra.info.type)
    );

    return `You are an SDK integration router that helps users interact with various services.

Available SDK Agents (credentials configured):
${available.map((ra) => `- ${ra.info.name}: ${ra.info.description}`).join("\n") || "- None configured"}

Unavailable SDK Agents (missing credentials):
${unavailable.map((ra) => `- ${ra.info.name}: ${ra.info.description}`).join("\n") || "- All configured"}

Your job is to:
1. Understand what the user wants to do
2. Route to the appropriate SDK agent
3. If multiple agents are needed, coordinate between them
4. Provide helpful responses even if credentials are missing

If credentials are missing:
- Explain which environment variables need to be set
- Provide setup instructions

Available tools:
- list_sdk_agents: See all SDK agents and their status
- route_to_sdk_agent: Send a request to a specific agent
- auto_route: Let the system automatically choose the best agent
- Individual agent tools for direct access`;
  },

  tools: [
    listSDKAgentsTool,
    routeToSDKAgentTool,
    autoRouteTool,
    // Add each agent as a tool for direct access
    agentAsTool(stripeAgent),
    agentAsTool(vercelAgent),
    agentAsTool(githubAgent),
    agentAsTool(dockerAgent),
    agentAsTool(supabaseAgent),
    agentAsTool(geminiAgent),
  ],

  maxTurns: 20,
  temperature: 0.3,
});

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick helper to run an SDK task
 */
export async function runSDKTask(
  input: string,
  ctx: SDKContext
): Promise<{ agent: string; output: string; success: boolean }> {
  const match = routeToAgent(input, ctx);

  if (!match) {
    return {
      agent: "none",
      output: "No matching agent found for this request",
      success: false,
    };
  }

  if (!match.hasCredentials) {
    return {
      agent: match.agent.info.name,
      output: `Agent ${match.agent.info.name} matched but credentials are not configured. Required: ${match.agent.info.requiredCredentials.join(", ")}`,
      success: false,
    };
  }

  try {
    const result = await match.agent.agent.run(input, ctx);
    return {
      agent: match.agent.info.name,
      output: String(result.finalOutput),
      success: true,
    };
  } catch (err) {
    return {
      agent: match.agent.info.name,
      output: err instanceof Error ? err.message : "Unknown error",
      success: false,
    };
  }
}

/**
 * Get setup instructions for an SDK agent
 */
export function getSetupInstructions(type: SDKAgentType): string {
  const info = getAgentInfo(type);
  if (!info) return "Unknown agent type";

  const envVars: Record<SDKAgentType, string[]> = {
    stripe: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    vercel: ["VERCEL_TOKEN", "VERCEL_TEAM_ID"],
    github: ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"],
    docker: ["DOCKER_HOST", "DOCKER_SOCKET_PATH"],
    supabase: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    gemini: ["GEMINI_API_KEY", "GEMINI_PROJECT_ID"],
  };

  const vars = envVars[type];
  const required = info.requiredCredentials;
  const optional = info.optionalCredentials;

  return `${info.name} Setup Instructions:

Environment Variables:
${vars.map((v, i) => `  ${v}${required.includes(info.requiredCredentials[i] || "") ? " (required)" : " (optional)"}`).join("\n")}

Add to your .env file:
\`\`\`
${vars.map((v) => `${v}=your_value_here`).join("\n")}
\`\`\`

Required credentials: ${required.join(", ") || "none"}
Optional credentials: ${optional.join(", ") || "none"}`;
}
