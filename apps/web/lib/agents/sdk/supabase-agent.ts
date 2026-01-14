/**
 * Supabase SDK Agent
 *
 * Handles Supabase database and backend tasks:
 * - Database queries and mutations
 * - Authentication management
 * - Storage operations
 * - Real-time subscriptions
 * - Edge functions
 * - Row Level Security
 */

import { z } from "zod";
import { Agent, tool } from "../core";
import type { SDKContext, SDKAgentInfo, ToolResponse } from "./types";
import { success, error, getCredential } from "./types";

// ============================================================================
// Agent Info
// ============================================================================

export const supabaseAgentInfo: SDKAgentInfo = {
  type: "supabase",
  name: "Supabase",
  description: "Database, authentication, storage, and real-time features",
  keywords: [
    "supabase",
    "database",
    "postgres",
    "auth",
    "authentication",
    "storage",
    "bucket",
    "realtime",
    "rls",
    "edge function",
    "sql",
  ],
  requiredCredentials: ["url", "anonKey"],
  optionalCredentials: ["serviceRoleKey"],
};

// ============================================================================
// Helper Functions
// ============================================================================

async function supabaseRequest(
  ctx: SDKContext,
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  useServiceRole = false
): Promise<ToolResponse> {
  const url = getCredential(ctx, "supabase", "url");
  const anonKey = getCredential(ctx, "supabase", "anonKey");
  const serviceKey = getCredential(ctx, "supabase", "serviceRoleKey");

  if (!url || !anonKey) {
    return error("Supabase URL and anon key required", "MISSING_CREDENTIALS");
  }

  const apiKey = useServiceRole && serviceKey ? serviceKey : anonKey;

  try {
    const fullUrl = `${url}${endpoint}`;
    const headers: Record<string, string> = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);
    const data = await response.json();

    if (!response.ok) {
      return error(
        data.message || data.error || "Supabase API error",
        data.code,
        data
      );
    }

    return success(data);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Supabase request failed",
      "REQUEST_FAILED"
    );
  }
}

// ============================================================================
// Database Tools
// ============================================================================

export const queryTableTool = tool<
  z.ZodObject<{
    table: z.ZodString;
    select: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
      column: z.ZodString;
      operator: z.ZodEnum<["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in", "is"]>;
      value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
    }>>>;
    orderBy: z.ZodOptional<z.ZodObject<{
      column: z.ZodString;
      ascending: z.ZodOptional<z.ZodBoolean>;
    }>>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_query",
  description: "Query data from a Supabase table",
  parameters: z.object({
    table: z.string().describe("Table name"),
    select: z.string().optional().describe("Columns to select (default: *)"),
    filters: z
      .array(
        z.object({
          column: z.string(),
          operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in", "is"]),
          value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
        })
      )
      .optional()
      .describe("Query filters"),
    orderBy: z
      .object({
        column: z.string(),
        ascending: z.boolean().optional(),
      })
      .optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  execute: async ({ table, select = "*", filters, orderBy, limit, offset }, ctx) => {
    let endpoint = `/rest/v1/${table}?select=${encodeURIComponent(select)}`;

    if (filters) {
      for (const filter of filters) {
        endpoint += `&${filter.column}=${filter.operator}.${encodeURIComponent(String(filter.value))}`;
      }
    }

    if (orderBy) {
      endpoint += `&order=${orderBy.column}.${orderBy.ascending ? "asc" : "desc"}`;
    }

    if (limit) endpoint += `&limit=${limit}`;
    if (offset) endpoint += `&offset=${offset}`;

    return supabaseRequest(ctx.context, endpoint);
  },
});

export const insertRowTool = tool<
  z.ZodObject<{
    table: z.ZodString;
    data: z.ZodRecord<z.ZodUnknown>;
    upsert: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_insert",
  description: "Insert a row into a table",
  parameters: z.object({
    table: z.string().describe("Table name"),
    data: z.record(z.unknown()).describe("Data to insert"),
    upsert: z.boolean().optional().describe("Upsert if exists"),
  }),
  execute: async ({ table, data, upsert = false }, ctx) => {
    let endpoint = `/rest/v1/${table}`;
    if (upsert) endpoint += "?on_conflict=id";
    return supabaseRequest(ctx.context, endpoint, "POST", data as Record<string, unknown>);
  },
});

export const updateRowTool = tool<
  z.ZodObject<{
    table: z.ZodString;
    data: z.ZodRecord<z.ZodUnknown>;
    filters: z.ZodArray<z.ZodObject<{
      column: z.ZodString;
      operator: z.ZodEnum<["eq", "neq"]>;
      value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_update",
  description: "Update rows in a table",
  parameters: z.object({
    table: z.string().describe("Table name"),
    data: z.record(z.unknown()).describe("Data to update"),
    filters: z.array(
      z.object({
        column: z.string(),
        operator: z.enum(["eq", "neq"]),
        value: z.union([z.string(), z.number()]),
      })
    ).describe("Filter conditions (required for safety)"),
  }),
  execute: async ({ table, data, filters }, ctx) => {
    let endpoint = `/rest/v1/${table}?`;
    for (const filter of filters) {
      endpoint += `${filter.column}=${filter.operator}.${encodeURIComponent(String(filter.value))}&`;
    }
    return supabaseRequest(ctx.context, endpoint, "PATCH", data as Record<string, unknown>);
  },
});

export const deleteRowTool = tool<
  z.ZodObject<{
    table: z.ZodString;
    filters: z.ZodArray<z.ZodObject<{
      column: z.ZodString;
      operator: z.ZodEnum<["eq", "neq"]>;
      value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_delete",
  description: "Delete rows from a table",
  parameters: z.object({
    table: z.string().describe("Table name"),
    filters: z.array(
      z.object({
        column: z.string(),
        operator: z.enum(["eq", "neq"]),
        value: z.union([z.string(), z.number()]),
      })
    ).describe("Filter conditions (required for safety)"),
  }),
  execute: async ({ table, filters }, ctx) => {
    let endpoint = `/rest/v1/${table}?`;
    for (const filter of filters) {
      endpoint += `${filter.column}=${filter.operator}.${encodeURIComponent(String(filter.value))}&`;
    }
    return supabaseRequest(ctx.context, endpoint, "DELETE");
  },
});

export const rpcCallTool = tool<
  z.ZodObject<{
    functionName: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodUnknown>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_rpc",
  description: "Call a Postgres function (RPC)",
  parameters: z.object({
    functionName: z.string().describe("Function name"),
    params: z.record(z.unknown()).optional().describe("Function parameters"),
  }),
  execute: async ({ functionName, params = {} }, ctx) => {
    return supabaseRequest(
      ctx.context,
      `/rest/v1/rpc/${functionName}`,
      "POST",
      params as Record<string, unknown>
    );
  },
});

// ============================================================================
// Auth Tools
// ============================================================================

export const listUsersTool = tool<
  z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    perPage: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_list_users",
  description: "List all users (requires service role key)",
  parameters: z.object({
    page: z.number().optional().describe("Page number"),
    perPage: z.number().optional().describe("Users per page"),
  }),
  execute: async ({ page = 1, perPage = 50 }, ctx) => {
    return supabaseRequest(
      ctx.context,
      `/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      "GET",
      undefined,
      true
    );
  },
});

export const getUserTool = tool<
  z.ZodObject<{ userId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_get_user",
  description: "Get user details (requires service role key)",
  parameters: z.object({
    userId: z.string().describe("User ID (UUID)"),
  }),
  execute: async ({ userId }, ctx) => {
    return supabaseRequest(
      ctx.context,
      `/auth/v1/admin/users/${userId}`,
      "GET",
      undefined,
      true
    );
  },
});

export const createUserTool = tool<
  z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    emailConfirm: z.ZodOptional<z.ZodBoolean>;
    userData: z.ZodOptional<z.ZodRecord<z.ZodUnknown>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_create_user",
  description: "Create a new user (requires service role key)",
  parameters: z.object({
    email: z.string().email().describe("User email"),
    password: z.string().min(6).describe("User password"),
    emailConfirm: z.boolean().optional().describe("Skip email confirmation"),
    userData: z.record(z.unknown()).optional().describe("Additional user metadata"),
  }),
  execute: async ({ email, password, emailConfirm = true, userData }, ctx) => {
    return supabaseRequest(
      ctx.context,
      "/auth/v1/admin/users",
      "POST",
      {
        email,
        password,
        email_confirm: emailConfirm,
        user_metadata: userData,
      },
      true
    );
  },
});

export const updateUserTool = tool<
  z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    userData: z.ZodOptional<z.ZodRecord<z.ZodUnknown>>;
    banned: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_update_user",
  description: "Update a user (requires service role key)",
  parameters: z.object({
    userId: z.string().describe("User ID"),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    userData: z.record(z.unknown()).optional(),
    banned: z.boolean().optional().describe("Ban/unban user"),
  }),
  execute: async ({ userId, email, password, userData, banned }, ctx) => {
    const body: Record<string, unknown> = {};
    if (email) body.email = email;
    if (password) body.password = password;
    if (userData) body.user_metadata = userData;
    if (banned !== undefined) body.ban_duration = banned ? "876000h" : "none";

    return supabaseRequest(
      ctx.context,
      `/auth/v1/admin/users/${userId}`,
      "PATCH",
      body,
      true
    );
  },
});

export const deleteUserTool = tool<
  z.ZodObject<{ userId: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_delete_user",
  description: "Delete a user (requires service role key)",
  parameters: z.object({
    userId: z.string().describe("User ID to delete"),
  }),
  execute: async ({ userId }, ctx) => {
    return supabaseRequest(
      ctx.context,
      `/auth/v1/admin/users/${userId}`,
      "DELETE",
      undefined,
      true
    );
  },
});

// ============================================================================
// Storage Tools
// ============================================================================

export const listBucketsTool = tool<
  z.ZodObject<Record<string, never>>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_list_buckets",
  description: "List storage buckets",
  parameters: z.object({}),
  execute: async (_, ctx) => {
    return supabaseRequest(ctx.context, "/storage/v1/bucket");
  },
});

export const createBucketTool = tool<
  z.ZodObject<{
    name: z.ZodString;
    public: z.ZodOptional<z.ZodBoolean>;
    fileSizeLimit: z.ZodOptional<z.ZodNumber>;
    allowedMimeTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_create_bucket",
  description: "Create a storage bucket",
  parameters: z.object({
    name: z.string().describe("Bucket name"),
    public: z.boolean().optional().describe("Make bucket public"),
    fileSizeLimit: z.number().optional().describe("Max file size in bytes"),
    allowedMimeTypes: z.array(z.string()).optional().describe("Allowed MIME types"),
  }),
  execute: async ({ name, public: isPublic = false, fileSizeLimit, allowedMimeTypes }, ctx) => {
    const body: Record<string, unknown> = {
      name,
      public: isPublic,
    };
    if (fileSizeLimit) body.file_size_limit = fileSizeLimit;
    if (allowedMimeTypes) body.allowed_mime_types = allowedMimeTypes;

    return supabaseRequest(ctx.context, "/storage/v1/bucket", "POST", body, true);
  },
});

export const listFilesTool = tool<
  z.ZodObject<{
    bucket: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "supabase_list_files",
  description: "List files in a bucket",
  parameters: z.object({
    bucket: z.string().describe("Bucket name"),
    path: z.string().optional().describe("Folder path"),
    limit: z.number().optional().describe("Max results"),
  }),
  execute: async ({ bucket, path = "", limit = 100 }, ctx) => {
    return supabaseRequest(
      ctx.context,
      `/storage/v1/object/list/${bucket}`,
      "POST",
      {
        prefix: path,
        limit,
      }
    );
  },
});

// ============================================================================
// Supabase Agent
// ============================================================================

export const supabaseAgent = Agent.create<SDKContext, string>({
  name: "SupabaseAgent",
  instructions: (ctx) => `You are a Supabase backend specialist.

Environment: ${ctx.environment}
${ctx.project ? `Project: ${ctx.project.name}` : ""}

You help with:
1. Database queries and mutations (PostgREST API)
2. User authentication management
3. Storage bucket and file operations
4. Real-time subscriptions
5. Row Level Security (RLS) policies
6. Edge Functions

Best Practices:
- Always use RLS policies for data security
- Use service role key only for admin operations
- Index frequently queried columns
- Use foreign keys for referential integrity
- Prefer RPC functions for complex queries
- Use storage policies for file access control

Database Schema (from init-db.sql):
- users: Authentication with bcrypt passwords
- contractors: Contractor profiles
- availability_slots: Scheduling system
- documents: With vector embeddings (pgvector)
- schema_version: Migration tracking

Default Admin: admin@local.dev / admin123

Security Reminders:
- Never expose service role key to clients
- Use anon key for client-side operations
- Always validate user input
- Use prepared statements (RPC functions)`,

  tools: [
    queryTableTool,
    insertRowTool,
    updateRowTool,
    deleteRowTool,
    rpcCallTool,
    listUsersTool,
    getUserTool,
    createUserTool,
    updateUserTool,
    deleteUserTool,
    listBucketsTool,
    createBucketTool,
    listFilesTool,
  ],

  maxTurns: 15,
  temperature: 0.3,
});
