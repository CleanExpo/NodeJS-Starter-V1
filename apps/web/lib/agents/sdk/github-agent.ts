/**
 * GitHub SDK Agent
 *
 * Handles GitHub repository management tasks:
 * - Manage repositories
 * - Handle issues and pull requests
 * - Manage branches and releases
 * - Configure workflows and actions
 * - Handle webhooks
 */

import { z } from "zod";
import { Agent, tool } from "../core";
import type { SDKContext, SDKAgentInfo, ToolResponse } from "./types";
import { success, error, getCredential } from "./types";

// ============================================================================
// Agent Info
// ============================================================================

export const githubAgentInfo: SDKAgentInfo = {
  type: "github",
  name: "GitHub",
  description: "Repository management, issues, PRs, and GitHub Actions",
  keywords: [
    "github",
    "git",
    "repository",
    "repo",
    "issue",
    "pull request",
    "pr",
    "branch",
    "release",
    "action",
    "workflow",
    "commit",
  ],
  requiredCredentials: ["token"],
  optionalCredentials: ["owner", "repo"],
};

// ============================================================================
// Helper Functions
// ============================================================================

async function githubRequest(
  ctx: SDKContext,
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<ToolResponse> {
  const token = getCredential(ctx, "github", "token");
  if (!token) {
    return error("GitHub token not configured", "MISSING_CREDENTIALS");
  }

  try {
    const url = `https://api.github.com${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 204) {
      return success({ message: "Success (no content)" });
    }

    const data = await response.json();

    if (!response.ok) {
      return error(
        data.message || "GitHub API error",
        String(response.status),
        data
      );
    }

    return success(data);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "GitHub request failed",
      "REQUEST_FAILED"
    );
  }
}

function getRepoPath(ctx: SDKContext, owner?: string, repo?: string): string | null {
  const o = owner || getCredential(ctx, "github", "owner");
  const r = repo || getCredential(ctx, "github", "repo");
  if (!o || !r) return null;
  return `${o}/${r}`;
}

// ============================================================================
// Repository Tools
// ============================================================================

export const listReposTool = tool<
  z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["all", "owner", "public", "private", "member"]>>;
    sort: z.ZodOptional<z.ZodEnum<["created", "updated", "pushed", "full_name"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_list_repos",
  description: "List repositories for the authenticated user",
  parameters: z.object({
    type: z.enum(["all", "owner", "public", "private", "member"]).optional(),
    sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
    limit: z.number().min(1).max(100).optional().describe("Max results (default 30)"),
  }),
  execute: async ({ type = "all", sort = "updated", limit = 30 }, ctx) => {
    return githubRequest(
      ctx.context,
      `/user/repos?type=${type}&sort=${sort}&per_page=${limit}`
    );
  },
});

export const getRepoTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_get_repo",
  description: "Get repository details",
  parameters: z.object({
    owner: z.string().optional().describe("Repository owner (uses default if not provided)"),
    repo: z.string().optional().describe("Repository name (uses default if not provided)"),
  }),
  execute: async ({ owner, repo }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}`);
  },
});

export const createRepoTool = tool<
  z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    private: z.ZodOptional<z.ZodBoolean>;
    autoInit: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_create_repo",
  description: "Create a new repository",
  parameters: z.object({
    name: z.string().describe("Repository name"),
    description: z.string().optional().describe("Repository description"),
    private: z.boolean().optional().describe("Make repository private"),
    autoInit: z.boolean().optional().describe("Initialize with README"),
  }),
  execute: async ({ name, description, private: isPrivate = false, autoInit = true }, ctx) => {
    return githubRequest(ctx.context, "/user/repos", "POST", {
      name,
      description,
      private: isPrivate,
      auto_init: autoInit,
    });
  },
});

// ============================================================================
// Issue Tools
// ============================================================================

export const listIssuesTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed", "all"]>>;
    labels: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_list_issues",
  description: "List issues for a repository",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    state: z.enum(["open", "closed", "all"]).optional(),
    labels: z.string().optional().describe("Comma-separated label names"),
    limit: z.number().min(1).max(100).optional(),
  }),
  execute: async ({ owner, repo, state = "open", labels, limit = 30 }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    let endpoint = `/repos/${path}/issues?state=${state}&per_page=${limit}`;
    if (labels) endpoint += `&labels=${encodeURIComponent(labels)}`;
    return githubRequest(ctx.context, endpoint);
  },
});

export const createIssueTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString>>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_create_issue",
  description: "Create a new issue",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    title: z.string().describe("Issue title"),
    body: z.string().optional().describe("Issue description (Markdown supported)"),
    labels: z.array(z.string()).optional().describe("Labels to add"),
    assignees: z.array(z.string()).optional().describe("Users to assign"),
  }),
  execute: async ({ owner, repo, title, body, labels, assignees }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/issues`, "POST", {
      title,
      body,
      labels,
      assignees,
    });
  },
});

export const updateIssueTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    issueNumber: z.ZodNumber;
    state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_update_issue",
  description: "Update an issue",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    issueNumber: z.number().describe("Issue number"),
    state: z.enum(["open", "closed"]).optional(),
    title: z.string().optional(),
    body: z.string().optional(),
  }),
  execute: async ({ owner, repo, issueNumber, ...updates }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/issues/${issueNumber}`, "PATCH", updates);
  },
});

// ============================================================================
// Pull Request Tools
// ============================================================================

export const listPRsTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed", "all"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_list_prs",
  description: "List pull requests",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    state: z.enum(["open", "closed", "all"]).optional(),
    limit: z.number().min(1).max(100).optional(),
  }),
  execute: async ({ owner, repo, state = "open", limit = 30 }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/pulls?state=${state}&per_page=${limit}`);
  },
});

export const createPRTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    head: z.ZodString;
    base: z.ZodOptional<z.ZodString>;
    draft: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_create_pr",
  description: "Create a pull request",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    title: z.string().describe("PR title"),
    body: z.string().optional().describe("PR description"),
    head: z.string().describe("Branch with changes"),
    base: z.string().optional().describe("Target branch (default: main)"),
    draft: z.boolean().optional().describe("Create as draft"),
  }),
  execute: async ({ owner, repo, title, body, head, base = "main", draft = false }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/pulls`, "POST", {
      title,
      body,
      head,
      base,
      draft,
    });
  },
});

export const mergePRTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    prNumber: z.ZodNumber;
    mergeMethod: z.ZodOptional<z.ZodEnum<["merge", "squash", "rebase"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_merge_pr",
  description: "Merge a pull request",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    prNumber: z.number().describe("PR number"),
    mergeMethod: z.enum(["merge", "squash", "rebase"]).optional(),
  }),
  execute: async ({ owner, repo, prNumber, mergeMethod = "squash" }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/pulls/${prNumber}/merge`, "PUT", {
      merge_method: mergeMethod,
    });
  },
});

// ============================================================================
// Branch and Release Tools
// ============================================================================

export const listBranchesTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_list_branches",
  description: "List repository branches",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
  }),
  execute: async ({ owner, repo }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/branches`);
  },
});

export const createReleaseTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    tagName: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    draft: z.ZodOptional<z.ZodBoolean>;
    prerelease: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_create_release",
  description: "Create a new release",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    tagName: z.string().describe("Tag name (e.g., v1.0.0)"),
    name: z.string().optional().describe("Release title"),
    body: z.string().optional().describe("Release notes (Markdown)"),
    draft: z.boolean().optional(),
    prerelease: z.boolean().optional(),
  }),
  execute: async ({ owner, repo, tagName, name, body, draft = false, prerelease = false }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/releases`, "POST", {
      tag_name: tagName,
      name: name || tagName,
      body,
      draft,
      prerelease,
    });
  },
});

// ============================================================================
// Workflow Tools
// ============================================================================

export const listWorkflowsTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_list_workflows",
  description: "List GitHub Actions workflows",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
  }),
  execute: async ({ owner, repo }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(ctx.context, `/repos/${path}/actions/workflows`);
  },
});

export const triggerWorkflowTool = tool<
  z.ZodObject<{
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    workflowId: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
    inputs: z.ZodOptional<z.ZodRecord<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "github_trigger_workflow",
  description: "Manually trigger a workflow",
  parameters: z.object({
    owner: z.string().optional(),
    repo: z.string().optional(),
    workflowId: z.string().describe("Workflow ID or filename"),
    ref: z.string().optional().describe("Branch or tag (default: main)"),
    inputs: z.record(z.string()).optional().describe("Workflow inputs"),
  }),
  execute: async ({ owner, repo, workflowId, ref = "main", inputs }, ctx) => {
    const path = getRepoPath(ctx.context, owner, repo);
    if (!path) return error("Owner and repo required", "MISSING_PARAMS");
    return githubRequest(
      ctx.context,
      `/repos/${path}/actions/workflows/${workflowId}/dispatches`,
      "POST",
      { ref, inputs }
    );
  },
});

// ============================================================================
// GitHub Agent
// ============================================================================

export const githubAgent = Agent.create<SDKContext, string>({
  name: "GitHubAgent",
  instructions: (ctx) => `You are a GitHub repository management specialist.

Environment: ${ctx.environment}
${ctx.credentials.github?.owner ? `Default Owner: ${ctx.credentials.github.owner}` : ""}
${ctx.credentials.github?.repo ? `Default Repo: ${ctx.credentials.github.repo}` : ""}
${ctx.project ? `Project: ${ctx.project.name}` : ""}

You help with:
1. Creating and managing repositories
2. Working with issues and pull requests
3. Managing branches and releases
4. Running and monitoring GitHub Actions
5. Setting up webhooks and integrations

Best Practices:
- Use conventional commits (feat:, fix:, docs:, etc.)
- Always create PRs for changes (never push directly to main)
- Use squash merging for cleaner history
- Add meaningful labels to issues
- Write clear PR descriptions with:
  - Summary of changes
  - Related issues (Fixes #123)
  - Testing instructions

Branch Naming:
- feature/description
- fix/description
- docs/description
- chore/description

For releases:
- Use semantic versioning (v1.0.0)
- Include changelog in release notes
- Mark pre-releases appropriately`,

  tools: [
    listReposTool,
    getRepoTool,
    createRepoTool,
    listIssuesTool,
    createIssueTool,
    updateIssueTool,
    listPRsTool,
    createPRTool,
    mergePRTool,
    listBranchesTool,
    createReleaseTool,
    listWorkflowsTool,
    triggerWorkflowTool,
  ],

  maxTurns: 15,
  temperature: 0.3,
});
