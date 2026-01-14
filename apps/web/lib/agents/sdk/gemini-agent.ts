/**
 * Gemini SDK Agent
 *
 * Handles Google Gemini AI tasks:
 * - Text generation and chat
 * - Image generation and editing
 * - Code generation
 * - Document analysis
 * - Multimodal understanding
 * - Based on @google/gemini-cli patterns
 */

import { z } from "zod";
import { Agent, tool } from "../core";
import type { SDKContext, SDKAgentInfo, ToolResponse } from "./types";
import { success, error, getCredential } from "./types";

// ============================================================================
// Agent Info
// ============================================================================

export const geminiAgentInfo: SDKAgentInfo = {
  type: "gemini",
  name: "Gemini",
  description: "AI text generation, image generation, and multimodal analysis",
  keywords: [
    "gemini",
    "ai",
    "generate",
    "image",
    "text",
    "code",
    "analyze",
    "multimodal",
    "vision",
    "chat",
    "google",
  ],
  requiredCredentials: ["apiKey"],
  optionalCredentials: ["projectId"],
};

// ============================================================================
// Helper Functions
// ============================================================================

async function geminiRequest(
  ctx: SDKContext,
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, unknown>
): Promise<ToolResponse> {
  const apiKey = getCredential(ctx, "gemini", "apiKey");
  if (!apiKey) {
    return error("Gemini API key not configured", "MISSING_CREDENTIALS");
  }

  try {
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const url = `${baseUrl}${endpoint}?key=${apiKey}`;

    const headers: Record<string, string> = {
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
        data.error?.message || "Gemini API error",
        data.error?.code,
        data.error
      );
    }

    return success(data);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Gemini request failed",
      "REQUEST_FAILED"
    );
  }
}

// ============================================================================
// Text Generation Tools
// ============================================================================

export const generateTextTool = tool<
  z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    systemInstruction: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_generate_text",
  description: "Generate text using Gemini AI",
  parameters: z.object({
    prompt: z.string().describe("The prompt to generate from"),
    model: z.string().optional().describe("Model (default: gemini-1.5-flash)"),
    maxTokens: z.number().optional().describe("Max output tokens"),
    temperature: z.number().min(0).max(2).optional().describe("Creativity (0-2)"),
    topP: z.number().min(0).max(1).optional().describe("Nucleus sampling"),
    systemInstruction: z.string().optional().describe("System instruction"),
  }),
  execute: async ({ prompt, model = "gemini-1.5-flash", maxTokens, temperature = 0.7, topP, systemInstruction }, ctx) => {
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    return geminiRequest(ctx.context, `/models/${model}:generateContent`, "POST", body);
  },
});

export const chatTool = tool<
  z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
      role: z.ZodEnum<["user", "model"]>;
      content: z.ZodString;
    }>>;
    model: z.ZodOptional<z.ZodString>;
    systemInstruction: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_chat",
  description: "Have a multi-turn conversation with Gemini",
  parameters: z.object({
    messages: z.array(
      z.object({
        role: z.enum(["user", "model"]).describe("Message role"),
        content: z.string().describe("Message content"),
      })
    ).describe("Conversation history"),
    model: z.string().optional().describe("Model (default: gemini-1.5-flash)"),
    systemInstruction: z.string().optional(),
  }),
  execute: async ({ messages, model = "gemini-1.5-flash", systemInstruction }, ctx) => {
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    return geminiRequest(ctx.context, `/models/${model}:generateContent`, "POST", body);
  },
});

export const streamGenerateTool = tool<
  z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_stream_generate",
  description: "Generate text with streaming (returns chunks)",
  parameters: z.object({
    prompt: z.string().describe("The prompt to generate from"),
    model: z.string().optional().describe("Model (default: gemini-1.5-flash)"),
  }),
  execute: async ({ prompt, model = "gemini-1.5-flash" }, ctx) => {
    // Note: Actual streaming would require SSE/WebSocket handling
    // This returns the full response with streaming info
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    return geminiRequest(ctx.context, `/models/${model}:streamGenerateContent`, "POST", body);
  },
});

// ============================================================================
// Image Generation Tools
// ============================================================================

export const generateImageTool = tool<
  z.ZodObject<{
    prompt: z.ZodString;
    numberOfImages: z.ZodOptional<z.ZodNumber>;
    aspectRatio: z.ZodOptional<z.ZodEnum<["1:1", "16:9", "9:16", "4:3", "3:4"]>>;
    negativePrompt: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_generate_image",
  description: "Generate images using Imagen via Gemini API",
  parameters: z.object({
    prompt: z.string().describe("Description of the image to generate"),
    numberOfImages: z.number().min(1).max(4).optional().describe("Number of images (1-4)"),
    aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
    negativePrompt: z.string().optional().describe("What to avoid in the image"),
  }),
  execute: async ({ prompt, numberOfImages = 1, aspectRatio = "1:1", negativePrompt }, ctx) => {
    const body: Record<string, unknown> = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: numberOfImages,
        aspectRatio,
      },
    };

    if (negativePrompt) {
      body.parameters = {
        ...(body.parameters as object),
        negativePrompt,
      };
    }

    // Note: Image generation uses a different endpoint (Vertex AI)
    return geminiRequest(ctx.context, "/models/imagen-3.0-generate-001:predict", "POST", body);
  },
});

export const analyzeImageTool = tool<
  z.ZodObject<{
    imageUrl: z.ZodOptional<z.ZodString>;
    imageBase64: z.ZodOptional<z.ZodString>;
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_analyze_image",
  description: "Analyze an image with Gemini Vision",
  parameters: z.object({
    imageUrl: z.string().url().optional().describe("URL of the image"),
    imageBase64: z.string().optional().describe("Base64 encoded image"),
    prompt: z.string().describe("Question or instruction about the image"),
    model: z.string().optional().describe("Model (default: gemini-1.5-flash)"),
  }),
  execute: async ({ imageUrl, imageBase64, prompt, model = "gemini-1.5-flash" }, ctx) => {
    if (!imageUrl && !imageBase64) {
      return error("Either imageUrl or imageBase64 is required", "MISSING_IMAGE");
    }

    const parts: Array<Record<string, unknown>> = [];

    if (imageUrl) {
      parts.push({
        fileData: {
          mimeType: "image/jpeg", // Could be detected
          fileUri: imageUrl,
        },
      });
    } else if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      });
    }

    parts.push({ text: prompt });

    const body = {
      contents: [{ parts }],
    };

    return geminiRequest(ctx.context, `/models/${model}:generateContent`, "POST", body);
  },
});

// ============================================================================
// Code Generation Tools
// ============================================================================

export const generateCodeTool = tool<
  z.ZodObject<{
    prompt: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_generate_code",
  description: "Generate code using Gemini",
  parameters: z.object({
    prompt: z.string().describe("Description of the code to generate"),
    language: z.string().optional().describe("Programming language"),
    context: z.string().optional().describe("Additional context or existing code"),
  }),
  execute: async ({ prompt, language, context }, ctx) => {
    let fullPrompt = prompt;
    if (language) {
      fullPrompt = `Generate ${language} code:\n\n${prompt}`;
    }
    if (context) {
      fullPrompt = `${fullPrompt}\n\nContext:\n${context}`;
    }

    const body = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.2, // Lower temperature for code
      },
      systemInstruction: {
        parts: [{
          text: `You are an expert programmer. Generate clean, well-documented, production-ready code.
                 Follow best practices and include error handling.
                 Use TypeScript for JavaScript/Node.js code.
                 Include comments explaining complex logic.`,
        }],
      },
    };

    return geminiRequest(ctx.context, "/models/gemini-1.5-pro:generateContent", "POST", body);
  },
});

export const explainCodeTool = tool<
  z.ZodObject<{
    code: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    detail: z.ZodOptional<z.ZodEnum<["brief", "detailed", "beginner"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_explain_code",
  description: "Explain code using Gemini",
  parameters: z.object({
    code: z.string().describe("Code to explain"),
    language: z.string().optional().describe("Programming language"),
    detail: z.enum(["brief", "detailed", "beginner"]).optional().describe("Level of detail"),
  }),
  execute: async ({ code, language, detail = "detailed" }, ctx) => {
    const detailInstructions = {
      brief: "Provide a brief, high-level explanation.",
      detailed: "Provide a detailed explanation of how the code works.",
      beginner: "Explain as if to a beginner, avoiding jargon.",
    };

    const prompt = `Explain the following${language ? ` ${language}` : ""} code:\n\n\`\`\`\n${code}\n\`\`\`\n\n${detailInstructions[detail]}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    return geminiRequest(ctx.context, "/models/gemini-1.5-flash:generateContent", "POST", body);
  },
});

// ============================================================================
// Document Analysis Tools
// ============================================================================

export const analyzeDocumentTool = tool<
  z.ZodObject<{
    documentUrl: z.ZodOptional<z.ZodString>;
    documentBase64: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    prompt: z.ZodString;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_analyze_document",
  description: "Analyze a document (PDF, etc.) with Gemini",
  parameters: z.object({
    documentUrl: z.string().url().optional().describe("URL of the document"),
    documentBase64: z.string().optional().describe("Base64 encoded document"),
    mimeType: z.string().optional().describe("MIME type (default: application/pdf)"),
    prompt: z.string().describe("Question or instruction about the document"),
  }),
  execute: async ({ documentUrl, documentBase64, mimeType = "application/pdf", prompt }, ctx) => {
    if (!documentUrl && !documentBase64) {
      return error("Either documentUrl or documentBase64 is required", "MISSING_DOCUMENT");
    }

    const parts: Array<Record<string, unknown>> = [];

    if (documentUrl) {
      parts.push({
        fileData: {
          mimeType,
          fileUri: documentUrl,
        },
      });
    } else if (documentBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: documentBase64,
        },
      });
    }

    parts.push({ text: prompt });

    const body = {
      contents: [{ parts }],
    };

    return geminiRequest(ctx.context, "/models/gemini-1.5-pro:generateContent", "POST", body);
  },
});

export const summarizeTool = tool<
  z.ZodObject<{
    text: z.ZodString;
    style: z.ZodOptional<z.ZodEnum<["bullet", "paragraph", "executive"]>>;
    maxLength: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_summarize",
  description: "Summarize text or documents",
  parameters: z.object({
    text: z.string().describe("Text to summarize"),
    style: z.enum(["bullet", "paragraph", "executive"]).optional().describe("Summary style"),
    maxLength: z.number().optional().describe("Max words in summary"),
  }),
  execute: async ({ text, style = "bullet", maxLength }, ctx) => {
    const styleInstructions = {
      bullet: "Use bullet points for key takeaways.",
      paragraph: "Write a cohesive paragraph summary.",
      executive: "Write an executive summary suitable for leadership.",
    };

    let prompt = `Summarize the following text. ${styleInstructions[style]}`;
    if (maxLength) {
      prompt += ` Keep it under ${maxLength} words.`;
    }
    prompt += `\n\nText:\n${text}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    return geminiRequest(ctx.context, "/models/gemini-1.5-flash:generateContent", "POST", body);
  },
});

// ============================================================================
// Model Tools
// ============================================================================

export const listModelsTool = tool<
  z.ZodObject<Record<string, never>>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_list_models",
  description: "List available Gemini models",
  parameters: z.object({}),
  execute: async (_, ctx) => {
    return geminiRequest(ctx.context, "/models", "GET");
  },
});

export const getModelTool = tool<
  z.ZodObject<{ model: z.ZodString }>,
  ToolResponse,
  SDKContext
>({
  name: "gemini_get_model",
  description: "Get details about a specific model",
  parameters: z.object({
    model: z.string().describe("Model name (e.g., gemini-1.5-pro)"),
  }),
  execute: async ({ model }, ctx) => {
    return geminiRequest(ctx.context, `/models/${model}`, "GET");
  },
});

// ============================================================================
// Gemini Agent
// ============================================================================

export const geminiAgent = Agent.create<SDKContext, string>({
  name: "GeminiAgent",
  instructions: (ctx) => `You are a Google Gemini AI specialist.

Environment: ${ctx.environment}
${ctx.project ? `Project: ${ctx.project.name}` : ""}

You help with:
1. Text generation and creative writing
2. Multi-turn conversations
3. Image generation and analysis
4. Code generation and explanation
5. Document analysis and summarization
6. Multimodal understanding

Available Models:
- gemini-1.5-flash: Fast, efficient for most tasks
- gemini-1.5-pro: Best quality, complex tasks
- gemini-1.5-flash-8b: Fastest, simple tasks
- imagen-3.0: Image generation

Best Practices:
- Use gemini-1.5-flash for speed-sensitive tasks
- Use gemini-1.5-pro for complex reasoning
- Lower temperature (0.1-0.3) for factual/code tasks
- Higher temperature (0.7-1.0) for creative tasks
- Provide clear, specific prompts
- Use system instructions for consistent behavior

For code generation:
- Specify the programming language
- Provide context about the project
- Request TypeScript for JavaScript projects
- Ask for error handling and comments

For image analysis:
- Be specific about what to analyze
- Ask targeted questions
- Can extract text, describe content, or analyze details`,

  tools: [
    generateTextTool,
    chatTool,
    streamGenerateTool,
    generateImageTool,
    analyzeImageTool,
    generateCodeTool,
    explainCodeTool,
    analyzeDocumentTool,
    summarizeTool,
    listModelsTool,
    getModelTool,
  ],

  maxTurns: 15,
  temperature: 0.5,
});
