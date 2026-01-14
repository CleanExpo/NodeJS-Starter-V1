/**
 * Vercel SDK Agent
 *
 * Handles Vercel deployment and hosting tasks:
 * - Deploy projects
 * - Manage deployments
 * - Configure domains
 * - Manage environment variables
 * - Monitor deployment status
 * - Handle preview deployments
 */

import { z } from "zod";
import { Agent, tool } from "../core";
import type { SDKContext, SDKAgentInfo, ToolResponse } from "./types";
import { success, error, getCredential } from "./types";

// ============================================================================
// Agent Info
// ============================================================================

export const vercelAgentInfo: SDKAgentInfo = {
  type: "vercel",
  name: "Vercel",
  description: "Deployment, hosting, and project management on Vercel",
  keywords: [
    "deploy",
    "vercel",
    "hosting",
    "deployment",
    "preview",
    "domain",
    "environment",
    "env",
    "build",
    "serverless",
    "edge",
  ],
  requiredCredentials: ["token"],
  optionalCredentials: ["teamId"],
};

// ============================================================================
// Helper Functions
// ============================================================================

async function vercelRequest(
  ctx: SDKContext,
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<ToolResponse> {
  const token = getCredential(ctx, "vercel", "token");
  if (!token) {
    return error("Vercel token not configured", "MISSING_CREDENTIALS");
  }

  const teamId = getCredential(ctx, "vercel", "teamId");

  try {
    let url = `https://api.vercel.com${endpoint}`;
    if (teamId && !url.includes("teamId=")) {
      url += url.includes("?") ? `&teamId=${teamId}` : `?teamId=${teamId}`;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return error(
        data.error?.message || "Vercel API error",
        data.error?.code,
        data.error
      );
    }

    return success(data);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Vercel request failed",
      "REQUEST_FAILED"
    );
  }
}

// ============================================================================
// Tools
// ============================================================================

export const listProjectsTool = tool<
  z.ZodObject<{ limit: z.ZodOptional<z.ZodNumber> }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_list_projects",
  description: "List all Vercel projects",
  parameters: z.object({
    limit: z.number().min(1).max(100).optional().describe("Max results (default 20)"),
  }),
  execute: async ({ limit = 20 }, ctx) => {
    return vercelRequest(ctx.context, `/v9/projects?limit=${limit}`);
  },
});

export const getProjectTool = tool<
  z.ZodObject<{ projectId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_get_project",
  description: "Get details of a specific project",
  parameters: z.object({
    projectId: z.string().describe("Project ID or name"),
  }),
  execute: async ({ projectId }, ctx) => {
    return vercelRequest(ctx.context, `/v9/projects/${projectId}`);
  },
});

export const createProjectTool = tool<
  z.ZodObject<{
    name: z.ZodString;
    framework: z.ZodOptional<z.ZodString>;
    gitRepository: z.ZodOptional<z.ZodObject<{
      type: z.ZodEnum<["github", "gitlab", "bitbucket"]>;
      repo: z.ZodString;
    }>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_create_project",
  description: "Create a new Vercel project",
  parameters: z.object({
    name: z.string().describe("Project name"),
    framework: z.string().optional().describe("Framework (nextjs, remix, etc.)"),
    gitRepository: z
      .object({
        type: z.enum(["github", "gitlab", "bitbucket"]).describe("Git provider"),
        repo: z.string().describe("Repository path (owner/repo)"),
      })
      .optional()
      .describe("Connect to Git repository"),
  }),
  execute: async ({ name, framework, gitRepository }, ctx) => {
    const body: Record<string, unknown> = { name };
    if (framework) body.framework = framework;
    if (gitRepository) body.gitRepository = gitRepository;
    return vercelRequest(ctx.context, "/v10/projects", "POST", body);
  },
});

export const listDeploymentsTool = tool<
  z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    state: z.ZodOptional<z.ZodEnum<["BUILDING", "ERROR", "INITIALIZING", "QUEUED", "READY", "CANCELED"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_list_deployments",
  description: "List deployments",
  parameters: z.object({
    projectId: z.string().optional().describe("Filter by project"),
    limit: z.number().min(1).max(100).optional().describe("Max results"),
    state: z
      .enum(["BUILDING", "ERROR", "INITIALIZING", "QUEUED", "READY", "CANCELED"])
      .optional()
      .describe("Filter by state"),
  }),
  execute: async ({ projectId, limit = 20, state }, ctx) => {
    let endpoint = `/v6/deployments?limit=${limit}`;
    if (projectId) endpoint += `&projectId=${projectId}`;
    if (state) endpoint += `&state=${state}`;
    return vercelRequest(ctx.context, endpoint);
  },
});

export const getDeploymentTool = tool<
  z.ZodObject<{ deploymentId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_get_deployment",
  description: "Get deployment details and status",
  parameters: z.object({
    deploymentId: z.string().describe("Deployment ID or URL"),
  }),
  execute: async ({ deploymentId }, ctx) => {
    return vercelRequest(ctx.context, `/v13/deployments/${deploymentId}`);
  },
});

export const cancelDeploymentTool = tool<
  z.ZodObject<{ deploymentId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_cancel_deployment",
  description: "Cancel an in-progress deployment",
  parameters: z.object({
    deploymentId: z.string().describe("Deployment ID to cancel"),
  }),
  execute: async ({ deploymentId }, ctx) => {
    return vercelRequest(ctx.context, `/v12/deployments/${deploymentId}/cancel`, "PATCH");
  },
});

export const listEnvVarsTool = tool<
  z.ZodObject<{ projectId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_list_env_vars",
  description: "List environment variables for a project",
  parameters: z.object({
    projectId: z.string().describe("Project ID or name"),
  }),
  execute: async ({ projectId }, ctx) => {
    return vercelRequest(ctx.context, `/v9/projects/${projectId}/env`);
  },
});

export const createEnvVarTool = tool<
  z.ZodObject<{
    projectId: z.ZodString;
    key: z.ZodString;
    value: z.ZodString;
    target: z.ZodArray<z.ZodEnum<["production", "preview", "development"]>>;
    type: z.ZodOptional<z.ZodEnum<["plain", "secret", "encrypted", "sensitive"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_create_env_var",
  description: "Create an environment variable",
  parameters: z.object({
    projectId: z.string().describe("Project ID or name"),
    key: z.string().describe("Variable name"),
    value: z.string().describe("Variable value"),
    target: z
      .array(z.enum(["production", "preview", "development"]))
      .describe("Environments to apply to"),
    type: z
      .enum(["plain", "secret", "encrypted", "sensitive"])
      .optional()
      .describe("Variable type (default: encrypted)"),
  }),
  execute: async ({ projectId, key, value, target, type = "encrypted" }, ctx) => {
    return vercelRequest(ctx.context, `/v10/projects/${projectId}/env`, "POST", {
      key,
      value,
      target,
      type,
    });
  },
});

export const deleteEnvVarTool = tool<
  z.ZodObject<{
    projectId: z.ZodString;
    envId: z.ZodString;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_delete_env_var",
  description: "Delete an environment variable",
  parameters: z.object({
    projectId: z.string().describe("Project ID or name"),
    envId: z.string().describe("Environment variable ID"),
  }),
  execute: async ({ projectId, envId }, ctx) => {
    return vercelRequest(ctx.context, `/v9/projects/${projectId}/env/${envId}`, "DELETE");
  },
});

export const listDomainsTool = tool<
  z.ZodObject<{ projectId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_list_domains",
  description: "List domains for a project",
  parameters: z.object({
    projectId: z.string().describe("Project ID or name"),
  }),
  execute: async ({ projectId }, ctx) => {
    return vercelRequest(ctx.context, `/v9/projects/${projectId}/domains`);
  },
});

export const addDomainTool = tool<
  z.ZodObject<{
    projectId: z.ZodString;
    domain: z.ZodString;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_add_domain",
  description: "Add a domain to a project",
  parameters: z.object({
    projectId: z.string().describe("Project ID or name"),
    domain: z.string().describe("Domain to add"),
  }),
  execute: async ({ projectId, domain }, ctx) => {
    return vercelRequest(ctx.context, `/v10/projects/${projectId}/domains`, "POST", {
      name: domain,
    });
  },
});

export const getDeploymentLogsTool = tool<
  z.ZodObject<{
    deploymentId: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<["build", "runtime"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_get_deployment_logs",
  description: "Get logs for a deployment",
  parameters: z.object({
    deploymentId: z.string().describe("Deployment ID"),
    type: z.enum(["build", "runtime"]).optional().describe("Log type"),
  }),
  execute: async ({ deploymentId, type }, ctx) => {
    let endpoint = `/v2/deployments/${deploymentId}/events`;
    if (type) endpoint += `?type=${type}`;
    return vercelRequest(ctx.context, endpoint);
  },
});

export const redeployTool = tool<
  z.ZodObject<{
    deploymentId: z.ZodString;
    target: z.ZodOptional<z.ZodEnum<["production", "preview"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "vercel_redeploy",
  description: "Redeploy an existing deployment",
  parameters: z.object({
    deploymentId: z.string().describe("Deployment ID to redeploy"),
    target: z.enum(["production", "preview"]).optional().describe("Target environment"),
  }),
  execute: async ({ deploymentId, target }, ctx) => {
    const body: Record<string, unknown> = { deploymentId };
    if (target) body.target = target;
    return vercelRequest(ctx.context, "/v13/deployments", "POST", body);
  },
});

// ============================================================================
// Vercel Agent
// ============================================================================

export const vercelAgent = Agent.create<SDKContext, string>({
  name: "VercelAgent",
  instructions: (ctx) => `You are a Vercel deployment and hosting specialist.

Environment: ${ctx.environment}
${ctx.project ? `Project: ${ctx.project.name} (${ctx.project.type})` : ""}

You help with:
1. Creating and managing Vercel projects
2. Deploying applications
3. Managing environment variables
4. Configuring custom domains
5. Monitoring deployment status
6. Troubleshooting build errors

Best Practices:
- Always use environment variables for secrets
- Set up preview deployments for PRs
- Use the edge runtime for optimal performance
- Configure proper caching headers
- Set up automatic HTTPS with custom domains

Framework Support:
- Next.js (recommended): Full support including ISR, API routes, middleware
- Remix, Astro, SvelteKit: Full framework support
- Static sites: Automatic CDN distribution

For Next.js projects:
- Use App Router for new projects (Next.js 13+)
- Configure proper serverless function regions
- Optimize for edge when possible`,

  tools: [
    listProjectsTool,
    getProjectTool,
    createProjectTool,
    listDeploymentsTool,
    getDeploymentTool,
    cancelDeploymentTool,
    listEnvVarsTool,
    createEnvVarTool,
    deleteEnvVarTool,
    listDomainsTool,
    addDomainTool,
    getDeploymentLogsTool,
    redeployTool,
  ],

  maxTurns: 15,
  temperature: 0.3,
});
