/**
 * Tool Definition System
 *
 * Based on OpenAI Agents SDK patterns:
 * - https://openai.github.io/openai-agents-js/guides/tools/
 *
 * Features:
 * - Zod schema validation for parameters
 * - Automatic JSON schema generation
 * - Error handling with custom error functions
 * - Type-safe tool execution
 */

import { z } from "zod";
import type { Tool, ToolExecuteContext, ModelTool } from "./types";

// ============================================================================
// Tool Factory
// ============================================================================

export interface ToolOptions<
  TInput extends z.ZodType,
  TOutput,
  TContext = unknown,
> {
  /** Unique name for the tool */
  name: string;
  /** Description of what the tool does and when to use it */
  description: string;
  /** Zod schema for input validation */
  parameters: TInput;
  /** Function to execute the tool */
  execute: (
    input: z.infer<TInput>,
    ctx: ToolExecuteContext<TContext>
  ) => Promise<TOutput> | TOutput;
  /** Optional function to format errors */
  errorFunction?: (error: Error, input: z.infer<TInput>) => string;
}

/**
 * Create a type-safe tool with Zod validation
 *
 * @example
 * ```typescript
 * const getWeatherTool = tool({
 *   name: "get_weather",
 *   description: "Get current weather for a city",
 *   parameters: z.object({
 *     city: z.string().describe("City name"),
 *     units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
 *   }),
 *   execute: async ({ city, units }) => {
 *     // Fetch weather data
 *     return { temperature: 22, conditions: "sunny" };
 *   },
 * });
 * ```
 */
export function tool<
  TInput extends z.ZodType,
  TOutput,
  TContext = unknown,
>(options: ToolOptions<TInput, TOutput, TContext>): Tool<TInput, TOutput, TContext> {
  return {
    name: options.name,
    description: options.description,
    parameters: options.parameters,
    execute: options.execute,
    errorFunction: options.errorFunction,
  };
}

// ============================================================================
// Zod to JSON Schema Conversion
// ============================================================================

/**
 * Convert Zod schema to JSON Schema for model API
 */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // Handle different Zod types
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
      properties[key] = zodToJsonSchema(zodValue);

      // Check if required (not optional)
      if (!(zodValue instanceof z.ZodOptional) && !(zodValue instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (schema instanceof z.ZodString) {
    const result: Record<string, unknown> = { type: "string" };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }

  if (schema instanceof z.ZodNumber) {
    const result: Record<string, unknown> = { type: "number" };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }

  if (schema instanceof z.ZodBoolean) {
    const result: Record<string, unknown> = { type: "boolean" };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema.element),
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: schema.options,
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }

  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(schema.removeDefault());
    return {
      ...inner,
      default: schema._def.defaultValue(),
    };
  }

  if (schema instanceof z.ZodNullable) {
    const inner = zodToJsonSchema(schema.unwrap());
    return {
      ...inner,
      nullable: true,
    };
  }

  if (schema instanceof z.ZodUnion) {
    return {
      oneOf: schema.options.map((opt: z.ZodType) => zodToJsonSchema(opt)),
    };
  }

  if (schema instanceof z.ZodLiteral) {
    return {
      type: typeof schema.value,
      const: schema.value,
    };
  }

  if (schema instanceof z.ZodRecord) {
    return {
      type: "object",
      additionalProperties: zodToJsonSchema(schema.valueSchema),
    };
  }

  // Fallback for unknown types
  return { type: "string" };
}

// ============================================================================
// Tool Conversion for Model API
// ============================================================================

/**
 * Convert a Tool to the model API format
 */
export function toolToModelFormat<TInput extends z.ZodType>(
  t: Tool<TInput, unknown, unknown>
): ModelTool {
  return {
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters),
    },
  };
}

/**
 * Convert multiple tools to model API format
 */
export function toolsToModelFormat(
  tools: Tool<z.ZodType, unknown, unknown>[]
): ModelTool[] {
  return tools.map(toolToModelFormat);
}

// ============================================================================
// Tool Execution
// ============================================================================

export interface ExecuteToolOptions<TContext> {
  tool: Tool<z.ZodType, unknown, TContext>;
  input: unknown;
  context: TContext;
  agentName: string;
  runId: string;
}

/**
 * Execute a tool with validation and error handling
 */
export async function executeTool<TContext>(
  options: ExecuteToolOptions<TContext>
): Promise<{ success: true; output: unknown } | { success: false; error: string }> {
  const { tool, input, context, agentName, runId } = options;

  try {
    // Parse and validate input
    const parsedInput = tool.parameters.parse(input);

    // Execute the tool
    const output = await tool.execute(parsedInput, {
      context,
      agentName,
      runId,
    });

    return { success: true, output };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // Use custom error function if provided
    if (tool.errorFunction) {
      try {
        const errorMessage = tool.errorFunction(err, input);
        return { success: false, error: errorMessage };
      } catch {
        // If error function throws, fall through to default
      }
    }

    // Default error message
    return {
      success: false,
      error: `Tool "${tool.name}" failed: ${err.message}`,
    };
  }
}

// ============================================================================
// Built-in Tools
// ============================================================================

/**
 * A tool that returns the current timestamp
 */
export const timestampTool = tool({
  name: "get_timestamp",
  description: "Get the current timestamp in ISO format",
  parameters: z.object({
    timezone: z.string().optional().describe("Timezone (e.g., 'Australia/Brisbane')"),
  }),
  execute: ({ timezone }) => {
    const now = new Date();
    if (timezone) {
      return now.toLocaleString("en-AU", { timeZone: timezone });
    }
    return now.toISOString();
  },
});

/**
 * A tool that waits for a specified duration
 */
export const waitTool = tool({
  name: "wait",
  description: "Wait for a specified number of milliseconds",
  parameters: z.object({
    ms: z.number().min(0).max(30000).describe("Milliseconds to wait (max 30 seconds)"),
  }),
  execute: async ({ ms }) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return { waited: ms };
  },
});

/**
 * A tool that performs a calculation
 */
export const calculateTool = tool({
  name: "calculate",
  description: "Perform a mathematical calculation",
  parameters: z.object({
    expression: z.string().describe("Mathematical expression to evaluate"),
  }),
  execute: ({ expression }) => {
    // Safe math evaluation (only allows numbers and basic operators)
    const safeExpression = expression.replace(/[^0-9+\-*/().%\s]/g, "");
    if (safeExpression !== expression) {
      throw new Error("Invalid characters in expression");
    }
    // Using Function constructor for safe evaluation of math expressions
    const result = new Function(`return ${safeExpression}`)();
    return { expression: safeExpression, result };
  },
  errorFunction: (error) => `Calculation error: ${error.message}`,
});

// ============================================================================
// Tool Registry
// ============================================================================

export class ToolRegistry<TContext = unknown> {
  private tools = new Map<string, Tool<z.ZodType, unknown, TContext>>();

  /**
   * Register a tool
   */
  register<TInput extends z.ZodType, TOutput>(
    t: Tool<TInput, TOutput, TContext>
  ): this {
    this.tools.set(t.name, t as Tool<z.ZodType, unknown, TContext>);
    return this;
  }

  /**
   * Get a tool by name
   */
  get(name: string): Tool<z.ZodType, unknown, TContext> | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAll(): Tool<z.ZodType, unknown, TContext>[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Remove a tool
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get tool count
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * Convert all tools to model format
   */
  toModelFormat(): ModelTool[] {
    return toolsToModelFormat(this.getAll());
  }
}

/**
 * Create a new tool registry
 */
export function createToolRegistry<TContext = unknown>(): ToolRegistry<TContext> {
  return new ToolRegistry<TContext>();
}
