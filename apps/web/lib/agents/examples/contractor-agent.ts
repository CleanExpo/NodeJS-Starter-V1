/**
 * Example: Contractor Availability Agent
 *
 * A specialized agent for managing contractor availability in Australia.
 * Demonstrates:
 * - Australian locale context
 * - Custom tools for availability management
 * - Input/output guardrails
 * - Structured output
 */

import { z } from "zod";
import {
  Agent,
  tool,
  inputGuardrail,
  outputGuardrail,
  continueResult,
  stopResult,
  createAustralianContext,
} from "../core";

// ============================================================================
// Australian Context
// ============================================================================

export interface ContractorContext {
  runId: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  features?: Record<string, boolean>;
  services?: Record<string, unknown>;
  // Australian locale
  state: "QLD" | "NSW" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";
  timezone: string;
  dateFormat: string;
  currency: string;
  gstRate: number;
  // Contractor-specific
  contractorId?: string;
  suburb?: string;
}

export function createContractorContext(
  options: {
    userId?: string;
    contractorId?: string;
    suburb?: string;
    state?: ContractorContext["state"];
  } = {}
): ContractorContext {
  const base = createAustralianContext({ state: options.state });
  return {
    ...base,
    contractorId: options.contractorId,
    suburb: options.suburb,
    userId: options.userId,
  };
}

// ============================================================================
// Tools
// ============================================================================

/**
 * Tool to check contractor availability
 */
export const checkAvailabilityTool = tool<
  z.ZodObject<{
    date: z.ZodString;
    suburb: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
  }>,
  { available: boolean; slots: string[]; message: string },
  ContractorContext
>({
  name: "check_availability",
  description: "Check contractor availability for a specific date and location in Australia",
  parameters: z.object({
    date: z.string().describe("Date in DD/MM/YYYY format"),
    suburb: z.string().describe("Brisbane suburb name"),
    state: z.string().optional().describe("Australian state (defaults to QLD)"),
  }),
  execute: async ({ date, suburb, state = "QLD" }, ctx) => {
    // Simulate availability check
    const isWeekend = (() => {
      const [day, month, year] = date.split("/").map(Number);
      const d = new Date(year, month - 1, day);
      return d.getDay() === 0 || d.getDay() === 6;
    })();

    if (isWeekend) {
      return {
        available: false,
        slots: [],
        message: `No availability on weekends. Date: ${date}, Location: ${suburb}, ${state}`,
      };
    }

    return {
      available: true,
      slots: ["09:00-12:00", "13:00-17:00"],
      message: `Available in ${suburb}, ${state} on ${date}`,
    };
  },
});

/**
 * Tool to book an appointment
 */
export const bookAppointmentTool = tool<
  z.ZodObject<{
    date: z.ZodString;
    timeSlot: z.ZodString;
    suburb: z.ZodString;
    customerName: z.ZodString;
    customerMobile: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
  }>,
  { success: boolean; bookingId: string; confirmation: string },
  ContractorContext
>({
  name: "book_appointment",
  description: "Book an appointment with the contractor",
  parameters: z.object({
    date: z.string().describe("Date in DD/MM/YYYY format"),
    timeSlot: z.string().describe("Time slot (e.g., '09:00-12:00')"),
    suburb: z.string().describe("Brisbane suburb"),
    customerName: z.string().describe("Customer's full name"),
    customerMobile: z.string().describe("Customer mobile (04XX XXX XXX format)"),
    notes: z.string().optional().describe("Additional notes"),
  }),
  execute: async ({ date, timeSlot, suburb, customerName, customerMobile, notes }, ctx) => {
    // Validate mobile format
    const mobileRegex = /^04\d{2}\s?\d{3}\s?\d{3}$/;
    if (!mobileRegex.test(customerMobile)) {
      throw new Error("Invalid Australian mobile format. Use 04XX XXX XXX");
    }

    // Generate booking ID
    const bookingId = `BK${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      bookingId,
      confirmation: `Booking confirmed for ${customerName}
Location: ${suburb}, ${ctx.context.state}
Date: ${date}
Time: ${timeSlot}
Mobile: ${customerMobile}
${notes ? `Notes: ${notes}` : ""}
Booking ID: ${bookingId}`,
    };
  },
});

/**
 * Tool to calculate quote with GST
 */
export const calculateQuoteTool = tool<
  z.ZodObject<{
    hours: z.ZodNumber;
    hourlyRate: z.ZodNumber;
    includeGst: z.ZodOptional<z.ZodBoolean>;
    calloutFee: z.ZodOptional<z.ZodNumber>;
  }>,
  { subtotal: number; gst: number; total: number; breakdown: string },
  ContractorContext
>({
  name: "calculate_quote",
  description: "Calculate a quote for contractor services (in AUD)",
  parameters: z.object({
    hours: z.number().min(0.5).max(24).describe("Number of hours"),
    hourlyRate: z.number().min(50).max(500).describe("Hourly rate in AUD"),
    includeGst: z.boolean().optional().describe("Include GST (default: true)"),
    calloutFee: z.number().optional().describe("Callout fee in AUD"),
  }),
  execute: ({ hours, hourlyRate, includeGst = true, calloutFee = 0 }, ctx) => {
    const subtotal = hours * hourlyRate + calloutFee;
    const gst = includeGst ? subtotal * ctx.context.gstRate : 0;
    const total = subtotal + gst;

    const breakdown = `
Quote Breakdown (AUD)
---------------------
Labour: ${hours}h x $${hourlyRate}/h = $${(hours * hourlyRate).toFixed(2)}
${calloutFee > 0 ? `Callout Fee: $${calloutFee.toFixed(2)}` : ""}
Subtotal: $${subtotal.toFixed(2)}
${includeGst ? `GST (10%): $${gst.toFixed(2)}` : "GST: Not applicable"}
---------------------
TOTAL: $${total.toFixed(2)}
`.trim();

    return { subtotal, gst, total, breakdown };
  },
});

// ============================================================================
// Guardrails
// ============================================================================

/**
 * Validate Australian date format
 */
export const australianDateGuardrail = inputGuardrail<ContractorContext>({
  name: "australian_date_format",
  description: "Validates dates are in DD/MM/YYYY format",
  validate: (input) => {
    // Check for American date formats
    const usDatePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;
    const matches = input.match(usDatePattern);

    if (matches) {
      for (const match of matches) {
        const [first, second] = match.split("/").map(Number);
        // If first number > 12, it's definitely day (AU format OK)
        // If first number <= 12 and second > 12, might be US format
        if (first <= 12 && second > 12) {
          return stopResult(
            "Please use Australian date format (DD/MM/YYYY). Detected possible US format."
          );
        }
      }
    }

    return continueResult();
  },
});

/**
 * Ensure prices include GST note
 */
export const gstOutputGuardrail = outputGuardrail<ContractorContext>({
  name: "gst_included",
  description: "Ensures output mentions GST when discussing prices",
  validate: (output) => {
    // Check if output contains price mentions
    const pricePattern = /\$\d+|\bAUD\b|\bdollars?\b/i;
    const hasPrice = pricePattern.test(output);

    if (hasPrice) {
      // Must mention GST
      const gstPattern = /\bGST\b|\bgst\b|goods and services tax/i;
      if (!gstPattern.test(output)) {
        return stopResult("Price information must include GST status (included or excluded)");
      }
    }

    return continueResult();
  },
});

// ============================================================================
// Agent
// ============================================================================

export const contractorAgent = Agent.create<ContractorContext, string>({
  name: "ContractorAvailability",
  instructions: (ctx) => `You are a contractor availability assistant for Australian services.

Current Location: ${ctx.suburb || "Brisbane"}, ${ctx.state}
Timezone: ${ctx.timezone}
Date Format: ${ctx.dateFormat} (DD/MM/YYYY - Australian standard)
Currency: ${ctx.currency}
GST Rate: ${ctx.gstRate * 100}%

You help customers:
1. Check contractor availability by date and location
2. Book appointments
3. Calculate quotes (always in AUD with GST)

Important Guidelines:
- Always use Australian date format (DD/MM/YYYY)
- Always specify prices in AUD with GST status
- Mobile numbers should be in 04XX XXX XXX format
- Be friendly and professional`,

  tools: [checkAvailabilityTool, bookAppointmentTool, calculateQuoteTool],

  inputGuardrails: [australianDateGuardrail],
  outputGuardrails: [gstOutputGuardrail],

  maxTurns: 10,
  temperature: 0.7,
});

// ============================================================================
// Usage Example
// ============================================================================

/**
 * Example usage:
 *
 * ```typescript
 * import { contractorAgent, createContractorContext } from './contractor-agent';
 * import { createRunner, createMockProvider } from '../core';
 *
 * // Create context
 * const ctx = createContractorContext({
 *   userId: 'user_123',
 *   suburb: 'Paddington',
 *   state: 'QLD',
 * });
 *
 * // Create runner with mock provider (for testing)
 * const runner = createRunner({
 *   modelProvider: createMockProvider([
 *     { content: 'Let me check availability for you...' },
 *   ]),
 * });
 *
 * // Run the agent
 * const result = await runner.run(
 *   contractorAgent,
 *   'Can you check if there is availability on 15/01/2025 in Paddington?',
 *   { context: ctx }
 * );
 *
 * console.log(result.finalOutput);
 * ```
 */
