/**
 * Guardrail System
 *
 * Guardrails provide safety checks for agent input and output.
 * They run in parallel with agent execution and can:
 * - Stop execution early if validation fails
 * - Escalate to human review
 * - Transform or filter content
 *
 * Based on OpenAI Agents SDK patterns.
 */

import type {
  InputGuardrail,
  OutputGuardrail,
  GuardrailResult,
  GuardrailAction,
  BaseContext,
} from "./types";
import type { BaseContext as ContextBase } from "./context";

// Re-export from context for convenience
type GuardrailContext = ContextBase;

// ============================================================================
// Guardrail Factory
// ============================================================================

export interface InputGuardrailOptions<TContext = unknown> {
  /** Unique name for the guardrail */
  name: string;
  /** Description of what this guardrail checks */
  description?: string;
  /** Validation function */
  validate: (
    input: string,
    ctx: TContext
  ) => Promise<GuardrailResult> | GuardrailResult;
}

export interface OutputGuardrailOptions<TContext = unknown> {
  /** Unique name for the guardrail */
  name: string;
  /** Description of what this guardrail checks */
  description?: string;
  /** Validation function */
  validate: (
    output: string,
    ctx: TContext
  ) => Promise<GuardrailResult> | GuardrailResult;
}

/**
 * Create an input guardrail
 */
export function inputGuardrail<TContext = unknown>(
  options: InputGuardrailOptions<TContext>
): InputGuardrail<TContext> {
  return {
    name: options.name,
    description: options.description,
    validate: options.validate,
  };
}

/**
 * Create an output guardrail
 */
export function outputGuardrail<TContext = unknown>(
  options: OutputGuardrailOptions<TContext>
): OutputGuardrail<TContext> {
  return {
    name: options.name,
    description: options.description,
    validate: options.validate,
  };
}

// ============================================================================
// Guardrail Results
// ============================================================================

/**
 * Create a "continue" result (validation passed)
 */
export function continueResult(message?: string): GuardrailResult {
  return { action: "continue", message };
}

/**
 * Create a "stop" result (validation failed, stop execution)
 */
export function stopResult(
  message: string,
  metadata?: Record<string, unknown>
): GuardrailResult {
  return { action: "stop", message, metadata };
}

/**
 * Create an "escalate" result (needs human review)
 */
export function escalateResult(
  message: string,
  metadata?: Record<string, unknown>
): GuardrailResult {
  return { action: "escalate", message, metadata };
}

// ============================================================================
// Built-in Input Guardrails
// ============================================================================

/**
 * Guardrail that checks for empty input
 */
export const emptyInputGuardrail = inputGuardrail({
  name: "empty_input",
  description: "Rejects empty or whitespace-only input",
  validate: (input) => {
    if (!input || input.trim().length === 0) {
      return stopResult("Input cannot be empty");
    }
    return continueResult();
  },
});

/**
 * Guardrail that checks input length
 */
export function maxLengthGuardrail(maxLength: number) {
  return inputGuardrail({
    name: "max_length",
    description: `Rejects input longer than ${maxLength} characters`,
    validate: (input) => {
      if (input.length > maxLength) {
        return stopResult(
          `Input exceeds maximum length of ${maxLength} characters (got ${input.length})`,
          { length: input.length, maxLength }
        );
      }
      return continueResult();
    },
  });
}

/**
 * Guardrail that blocks certain patterns
 */
export function patternBlockGuardrail(
  patterns: RegExp[],
  name = "pattern_block"
) {
  return inputGuardrail({
    name,
    description: "Blocks input matching specific patterns",
    validate: (input) => {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return stopResult(`Input contains blocked pattern: ${pattern.source}`);
        }
      }
      return continueResult();
    },
  });
}

/**
 * Guardrail that detects potential prompt injection
 */
export const promptInjectionGuardrail = inputGuardrail({
  name: "prompt_injection",
  description: "Detects potential prompt injection attempts",
  validate: (input) => {
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|prompts?)/i,
      /disregard\s+(all\s+)?(previous|above|prior)/i,
      /you\s+are\s+now\s+[a-z]+\s+mode/i,
      /system\s*:\s*you\s+are/i,
      /\[\s*system\s*\]/i,
      /forget\s+(everything|all)\s+(you|i)\s+(know|said|told)/i,
      /pretend\s+(you\s+are|to\s+be)/i,
      /act\s+as\s+if\s+you/i,
      /override\s+(your|the)\s+(instructions?|rules?|guidelines?)/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        return escalateResult("Potential prompt injection detected", {
          pattern: pattern.source,
          input: input.slice(0, 100),
        });
      }
    }
    return continueResult();
  },
});

/**
 * Guardrail that requires certain keywords
 */
export function requireKeywordsGuardrail(keywords: string[], minMatch = 1) {
  return inputGuardrail({
    name: "require_keywords",
    description: `Requires at least ${minMatch} of: ${keywords.join(", ")}`,
    validate: (input) => {
      const lowerInput = input.toLowerCase();
      const matches = keywords.filter((kw) =>
        lowerInput.includes(kw.toLowerCase())
      );

      if (matches.length < minMatch) {
        return stopResult(
          `Input must contain at least ${minMatch} of: ${keywords.join(", ")}`
        );
      }
      return continueResult();
    },
  });
}

// ============================================================================
// Built-in Output Guardrails
// ============================================================================

/**
 * Guardrail that checks for sensitive data in output
 */
export const sensitiveDataGuardrail = outputGuardrail({
  name: "sensitive_data",
  description: "Blocks output containing sensitive data patterns",
  validate: (output) => {
    const sensitivePatterns = [
      // Credit card numbers
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      // SSN
      /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
      // API keys (generic pattern)
      /\b(sk|pk|api|key)[-_]?[a-zA-Z0-9]{20,}\b/i,
      // Email with password
      /password\s*[:=]\s*\S+/i,
      // JWT tokens
      /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(output)) {
        return stopResult("Output contains potentially sensitive data", {
          pattern: pattern.source,
        });
      }
    }
    return continueResult();
  },
});

/**
 * Guardrail that enforces output length limits
 */
export function maxOutputLengthGuardrail(maxLength: number) {
  return outputGuardrail({
    name: "max_output_length",
    description: `Rejects output longer than ${maxLength} characters`,
    validate: (output) => {
      if (output.length > maxLength) {
        return stopResult(
          `Output exceeds maximum length of ${maxLength} characters`,
          { length: output.length, maxLength }
        );
      }
      return continueResult();
    },
  });
}

/**
 * Guardrail that checks for required sections in output
 */
export function requiredSectionsGuardrail(sections: string[]) {
  return outputGuardrail({
    name: "required_sections",
    description: `Requires output to contain: ${sections.join(", ")}`,
    validate: (output) => {
      const lowerOutput = output.toLowerCase();
      const missing = sections.filter(
        (section) => !lowerOutput.includes(section.toLowerCase())
      );

      if (missing.length > 0) {
        return stopResult(`Output missing required sections: ${missing.join(", ")}`, {
          missing,
        });
      }
      return continueResult();
    },
  });
}

/**
 * Guardrail that blocks certain words in output
 */
export function blockedWordsGuardrail(words: string[]) {
  return outputGuardrail({
    name: "blocked_words",
    description: "Blocks output containing specified words",
    validate: (output) => {
      const lowerOutput = output.toLowerCase();
      const found = words.filter((word) =>
        lowerOutput.includes(word.toLowerCase())
      );

      if (found.length > 0) {
        return stopResult(`Output contains blocked words: ${found.join(", ")}`, {
          found,
        });
      }
      return continueResult();
    },
  });
}

// ============================================================================
// Guardrail Composition
// ============================================================================

/**
 * Combine multiple input guardrails into one
 */
export function combineInputGuardrails<TContext>(
  guardrails: InputGuardrail<TContext>[],
  name = "combined_input"
): InputGuardrail<TContext> {
  return inputGuardrail({
    name,
    description: `Combined guardrail: ${guardrails.map((g) => g.name).join(", ")}`,
    validate: async (input, ctx) => {
      for (const guardrail of guardrails) {
        const result = await guardrail.validate(input, ctx);
        if (result.action !== "continue") {
          return {
            ...result,
            metadata: {
              ...result.metadata,
              failedGuardrail: guardrail.name,
            },
          };
        }
      }
      return continueResult();
    },
  });
}

/**
 * Combine multiple output guardrails into one
 */
export function combineOutputGuardrails<TContext>(
  guardrails: OutputGuardrail<TContext>[],
  name = "combined_output"
): OutputGuardrail<TContext> {
  return outputGuardrail({
    name,
    description: `Combined guardrail: ${guardrails.map((g) => g.name).join(", ")}`,
    validate: async (output, ctx) => {
      for (const guardrail of guardrails) {
        const result = await guardrail.validate(output, ctx);
        if (result.action !== "continue") {
          return {
            ...result,
            metadata: {
              ...result.metadata,
              failedGuardrail: guardrail.name,
            },
          };
        }
      }
      return continueResult();
    },
  });
}

// ============================================================================
// Guardrail Runner
// ============================================================================

export interface GuardrailRunResult {
  passed: boolean;
  action: GuardrailAction;
  results: Array<{
    guardrailName: string;
    result: GuardrailResult;
    duration_ms: number;
  }>;
  failedGuardrail?: string;
  message?: string;
}

/**
 * Run multiple guardrails in parallel
 */
export async function runGuardrails<TContext>(
  guardrails: Array<InputGuardrail<TContext> | OutputGuardrail<TContext>>,
  content: string,
  ctx: TContext
): Promise<GuardrailRunResult> {
  const results: GuardrailRunResult["results"] = [];
  let passed = true;
  let action: GuardrailAction = "continue";
  let failedGuardrail: string | undefined;
  let message: string | undefined;

  // Run all guardrails in parallel
  const promises = guardrails.map(async (guardrail) => {
    const start = Date.now();
    const result = await guardrail.validate(content, ctx);
    return {
      guardrailName: guardrail.name,
      result,
      duration_ms: Date.now() - start,
    };
  });

  const allResults = await Promise.all(promises);

  for (const r of allResults) {
    results.push(r);

    // Check for failures (first failure wins)
    if (r.result.action !== "continue" && passed) {
      passed = false;
      action = r.result.action;
      failedGuardrail = r.guardrailName;
      message = r.result.message;
    }
  }

  return {
    passed,
    action,
    results,
    failedGuardrail,
    message,
  };
}
