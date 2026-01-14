/**
 * Docker SDK Agent
 *
 * Handles Docker container and image management:
 * - Build and manage images
 * - Create and manage containers
 * - Handle volumes and networks
 * - Docker Compose operations
 * - Container logs and stats
 */

import { z } from "zod";
import { Agent, tool } from "../core";
import type { SDKContext, SDKAgentInfo, ToolResponse } from "./types";
import { success, error, getCredential } from "./types";

// ============================================================================
// Agent Info
// ============================================================================

export const dockerAgentInfo: SDKAgentInfo = {
  type: "docker",
  name: "Docker",
  description: "Container management, images, and Docker Compose",
  keywords: [
    "docker",
    "container",
    "image",
    "compose",
    "volume",
    "network",
    "build",
    "run",
    "logs",
    "dockerfile",
  ],
  requiredCredentials: [],
  optionalCredentials: ["host", "socketPath"],
};

// ============================================================================
// Helper Functions
// ============================================================================

async function dockerRequest(
  ctx: SDKContext,
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<ToolResponse> {
  // Docker API typically runs on unix socket or TCP
  const host = getCredential(ctx, "docker", "host") || "http://localhost:2375";

  try {
    const url = `${host}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 204) {
      return success({ message: "Success" });
    }

    const data = await response.json();

    if (!response.ok) {
      return error(data.message || "Docker API error", String(response.status));
    }

    return success(data);
  } catch (err) {
    // If Docker API is not available, provide CLI command
    return error(
      `Docker API not available. Use CLI: docker ${endpoint.replace("/v1.43/", "").replace(/\//g, " ")}`,
      "API_UNAVAILABLE"
    );
  }
}

// ============================================================================
// Container Tools
// ============================================================================

export const listContainersTool = tool<
  z.ZodObject<{
    all: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodOptional<z.ZodNumber>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_list_containers",
  description: "List Docker containers",
  parameters: z.object({
    all: z.boolean().optional().describe("Show all containers (default: running only)"),
    limit: z.number().optional().describe("Max number of containers"),
    filters: z.record(z.string()).optional().describe("Filter containers"),
  }),
  execute: async ({ all = false, limit, filters }, ctx) => {
    let endpoint = `/v1.43/containers/json?all=${all}`;
    if (limit) endpoint += `&limit=${limit}`;
    if (filters) endpoint += `&filters=${JSON.stringify(filters)}`;
    return dockerRequest(ctx.context, endpoint);
  },
});

export const createContainerTool = tool<
  z.ZodObject<{
    image: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    env: z.ZodOptional<z.ZodArray<z.ZodString>>;
    ports: z.ZodOptional<z.ZodRecord<z.ZodString>>;
    volumes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    cmd: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_create_container",
  description: "Create a new container",
  parameters: z.object({
    image: z.string().describe("Image name"),
    name: z.string().optional().describe("Container name"),
    env: z.array(z.string()).optional().describe("Environment variables (KEY=value)"),
    ports: z.record(z.string()).optional().describe("Port mappings (container: host)"),
    volumes: z.array(z.string()).optional().describe("Volume mounts (host:container)"),
    cmd: z.array(z.string()).optional().describe("Command to run"),
  }),
  execute: async ({ image, name, env, ports, volumes, cmd }, ctx) => {
    const body: Record<string, unknown> = {
      Image: image,
      Env: env,
      Cmd: cmd,
    };

    if (ports) {
      const exposedPorts: Record<string, object> = {};
      const portBindings: Record<string, Array<{ HostPort: string }>> = {};
      for (const [container, host] of Object.entries(ports)) {
        exposedPorts[`${container}/tcp`] = {};
        portBindings[`${container}/tcp`] = [{ HostPort: host }];
      }
      body.ExposedPorts = exposedPorts;
      body.HostConfig = { PortBindings: portBindings };
    }

    if (volumes) {
      const binds = volumes;
      body.HostConfig = { ...(body.HostConfig as object || {}), Binds: binds };
    }

    let endpoint = "/v1.43/containers/create";
    if (name) endpoint += `?name=${name}`;

    return dockerRequest(ctx.context, endpoint, "POST", body);
  },
});

export const startContainerTool = tool<
  z.ZodObject<{ containerId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_start_container",
  description: "Start a stopped container",
  parameters: z.object({
    containerId: z.string().describe("Container ID or name"),
  }),
  execute: async ({ containerId }, ctx) => {
    return dockerRequest(ctx.context, `/v1.43/containers/${containerId}/start`, "POST");
  },
});

export const stopContainerTool = tool<
  z.ZodObject<{
    containerId: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_stop_container",
  description: "Stop a running container",
  parameters: z.object({
    containerId: z.string().describe("Container ID or name"),
    timeout: z.number().optional().describe("Seconds to wait before killing"),
  }),
  execute: async ({ containerId, timeout }, ctx) => {
    let endpoint = `/v1.43/containers/${containerId}/stop`;
    if (timeout) endpoint += `?t=${timeout}`;
    return dockerRequest(ctx.context, endpoint, "POST");
  },
});

export const removeContainerTool = tool<
  z.ZodObject<{
    containerId: z.ZodString;
    force: z.ZodOptional<z.ZodBoolean>;
    volumes: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_remove_container",
  description: "Remove a container",
  parameters: z.object({
    containerId: z.string().describe("Container ID or name"),
    force: z.boolean().optional().describe("Force remove running container"),
    volumes: z.boolean().optional().describe("Remove associated volumes"),
  }),
  execute: async ({ containerId, force = false, volumes = false }, ctx) => {
    return dockerRequest(
      ctx.context,
      `/v1.43/containers/${containerId}?force=${force}&v=${volumes}`,
      "DELETE"
    );
  },
});

export const containerLogsTool = tool<
  z.ZodObject<{
    containerId: z.ZodString;
    tail: z.ZodOptional<z.ZodNumber>;
    since: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_container_logs",
  description: "Get container logs",
  parameters: z.object({
    containerId: z.string().describe("Container ID or name"),
    tail: z.number().optional().describe("Number of lines from end"),
    since: z.string().optional().describe("Show logs since timestamp"),
  }),
  execute: async ({ containerId, tail, since }, ctx) => {
    let endpoint = `/v1.43/containers/${containerId}/logs?stdout=true&stderr=true`;
    if (tail) endpoint += `&tail=${tail}`;
    if (since) endpoint += `&since=${since}`;
    return dockerRequest(ctx.context, endpoint);
  },
});

export const containerStatsTool = tool<
  z.ZodObject<{ containerId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_container_stats",
  description: "Get container resource usage statistics",
  parameters: z.object({
    containerId: z.string().describe("Container ID or name"),
  }),
  execute: async ({ containerId }, ctx) => {
    return dockerRequest(ctx.context, `/v1.43/containers/${containerId}/stats?stream=false`);
  },
});

// ============================================================================
// Image Tools
// ============================================================================

export const listImagesTool = tool<
  z.ZodObject<{ all: z.ZodOptional<z.ZodBoolean> }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_list_images",
  description: "List Docker images",
  parameters: z.object({
    all: z.boolean().optional().describe("Show all images including intermediate"),
  }),
  execute: async ({ all = false }, ctx) => {
    return dockerRequest(ctx.context, `/v1.43/images/json?all=${all}`);
  },
});

export const pullImageTool = tool<
  z.ZodObject<{
    image: z.ZodString;
    tag: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_pull_image",
  description: "Pull an image from registry",
  parameters: z.object({
    image: z.string().describe("Image name"),
    tag: z.string().optional().describe("Image tag (default: latest)"),
  }),
  execute: async ({ image, tag = "latest" }, ctx) => {
    return dockerRequest(
      ctx.context,
      `/v1.43/images/create?fromImage=${image}&tag=${tag}`,
      "POST"
    );
  },
});

export const removeImageTool = tool<
  z.ZodObject<{
    image: z.ZodString;
    force: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_remove_image",
  description: "Remove an image",
  parameters: z.object({
    image: z.string().describe("Image ID or name"),
    force: z.boolean().optional().describe("Force remove"),
  }),
  execute: async ({ image, force = false }, ctx) => {
    return dockerRequest(ctx.context, `/v1.43/images/${image}?force=${force}`, "DELETE");
  },
});

// ============================================================================
// Volume Tools
// ============================================================================

export const listVolumesTool = tool<
  z.ZodObject<Record<string, never>>,
  ToolResponse,
  SDKContext
>({
  name: "docker_list_volumes",
  description: "List Docker volumes",
  parameters: z.object({}),
  execute: async (_, ctx) => {
    return dockerRequest(ctx.context, "/v1.43/volumes");
  },
});

export const createVolumeTool = tool<
  z.ZodObject<{
    name: z.ZodString;
    driver: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_create_volume",
  description: "Create a volume",
  parameters: z.object({
    name: z.string().describe("Volume name"),
    driver: z.string().optional().describe("Volume driver (default: local)"),
  }),
  execute: async ({ name, driver = "local" }, ctx) => {
    return dockerRequest(ctx.context, "/v1.43/volumes/create", "POST", {
      Name: name,
      Driver: driver,
    });
  },
});

// ============================================================================
// Network Tools
// ============================================================================

export const listNetworksTool = tool<
  z.ZodObject<Record<string, never>>,
  ToolResponse,
  SDKContext
>({
  name: "docker_list_networks",
  description: "List Docker networks",
  parameters: z.object({}),
  execute: async (_, ctx) => {
    return dockerRequest(ctx.context, "/v1.43/networks");
  },
});

export const createNetworkTool = tool<
  z.ZodObject<{
    name: z.ZodString;
    driver: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_create_network",
  description: "Create a network",
  parameters: z.object({
    name: z.string().describe("Network name"),
    driver: z.string().optional().describe("Network driver (default: bridge)"),
  }),
  execute: async ({ name, driver = "bridge" }, ctx) => {
    return dockerRequest(ctx.context, "/v1.43/networks/create", "POST", {
      Name: name,
      Driver: driver,
    });
  },
});

// ============================================================================
// System Tools
// ============================================================================

export const dockerInfoTool = tool<
  z.ZodObject<Record<string, never>>,
  ToolResponse,
  SDKContext
>({
  name: "docker_info",
  description: "Get Docker system information",
  parameters: z.object({}),
  execute: async (_, ctx) => {
    return dockerRequest(ctx.context, "/v1.43/info");
  },
});

export const dockerPruneTool = tool<
  z.ZodObject<{
    what: z.ZodEnum<["containers", "images", "volumes", "networks", "system"]>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "docker_prune",
  description: "Remove unused Docker resources",
  parameters: z.object({
    what: z.enum(["containers", "images", "volumes", "networks", "system"]).describe("What to prune"),
  }),
  execute: async ({ what }, ctx) => {
    const endpoint =
      what === "system"
        ? "/v1.43/system/prune"
        : `/v1.43/${what}/prune`;
    return dockerRequest(ctx.context, endpoint, "POST");
  },
});

// ============================================================================
// Docker Agent
// ============================================================================

export const dockerAgent = Agent.create<SDKContext, string>({
  name: "DockerAgent",
  instructions: (ctx) => `You are a Docker container management specialist.

Environment: ${ctx.environment}
${ctx.project ? `Project: ${ctx.project.name}` : ""}

You help with:
1. Creating and managing containers
2. Building and managing images
3. Configuring volumes and networks
4. Docker Compose orchestration
5. Troubleshooting container issues
6. Optimizing container performance

Best Practices:
- Use specific image tags, not :latest in production
- Always set resource limits (memory, CPU)
- Use health checks for production containers
- Mount volumes for persistent data
- Use networks for container communication
- Clean up unused resources regularly

Common Commands (for reference):
- docker compose up -d: Start services in background
- docker compose down: Stop and remove containers
- docker compose logs -f: Follow logs
- docker compose ps: List services

For this project (docker-compose.yml):
- PostgreSQL 15 with pgvector on port 5432
- Redis 7 on port 6379
- Use 'docker compose up -d' to start
- Use 'docker compose down -v' to reset with data`,

  tools: [
    listContainersTool,
    createContainerTool,
    startContainerTool,
    stopContainerTool,
    removeContainerTool,
    containerLogsTool,
    containerStatsTool,
    listImagesTool,
    pullImageTool,
    removeImageTool,
    listVolumesTool,
    createVolumeTool,
    listNetworksTool,
    createNetworkTool,
    dockerInfoTool,
    dockerPruneTool,
  ],

  maxTurns: 15,
  temperature: 0.3,
});
