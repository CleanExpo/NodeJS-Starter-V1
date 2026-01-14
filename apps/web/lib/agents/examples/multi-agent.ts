/**
 * Example: Multi-Agent Orchestration
 *
 * Demonstrates multi-agent patterns from the OpenAI Agents SDK:
 * - Manager pattern (agent as tool)
 * - Handoffs between agents
 * - Agent chains
 * - Parallel execution
 */

import { z } from "zod";
import {
  Agent,
  tool,
  handoff,
  createRouter,
  keywordSelector,
  executeChain,
  executeParallel,
  agentAsTool,
  createContext,
} from "../core";
import type { BaseContext } from "../core";

// ============================================================================
// Context
// ============================================================================

export interface SupportContext extends BaseContext {
  customerTier: "free" | "pro" | "enterprise";
  ticketId?: string;
}

export function createSupportContext(
  options: { customerTier?: SupportContext["customerTier"]; ticketId?: string } = {}
): SupportContext {
  return createContext<SupportContext>({
    initial: {
      customerTier: options.customerTier || "free",
      ticketId: options.ticketId,
    },
  });
}

// ============================================================================
// Specialized Agents
// ============================================================================

/**
 * Technical Support Agent
 * Handles technical issues and troubleshooting
 */
export const technicalSupportAgent = Agent.create<SupportContext, string>({
  name: "TechnicalSupport",
  instructions: `You are a technical support specialist.

Your responsibilities:
- Diagnose technical issues
- Provide step-by-step troubleshooting
- Explain technical concepts clearly
- Escalate complex issues when needed

Be patient and thorough in your explanations.`,

  tools: [
    tool({
      name: "check_system_status",
      description: "Check the status of a system or service",
      parameters: z.object({
        system: z.string().describe("System name to check"),
      }),
      execute: async ({ system }) => {
        // Simulate system check
        return {
          system,
          status: "operational",
          latency: "45ms",
          lastIncident: "none",
        };
      },
    }),
    tool({
      name: "create_diagnostic_report",
      description: "Create a diagnostic report for an issue",
      parameters: z.object({
        issue: z.string().describe("Description of the issue"),
        severity: z.enum(["low", "medium", "high"]).describe("Issue severity"),
      }),
      execute: async ({ issue, severity }) => {
        return {
          reportId: `DIAG-${Date.now().toString(36).toUpperCase()}`,
          issue,
          severity,
          recommendations: [
            "Clear browser cache",
            "Check network connectivity",
            "Verify credentials",
          ],
        };
      },
    }),
  ],
});

/**
 * Billing Support Agent
 * Handles billing and payment issues
 */
export const billingSupportAgent = Agent.create<SupportContext, string>({
  name: "BillingSupport",
  instructions: (ctx) => `You are a billing support specialist.

Customer Tier: ${ctx.customerTier}
${ctx.ticketId ? `Ticket: ${ctx.ticketId}` : ""}

Your responsibilities:
- Handle billing inquiries
- Process refund requests
- Explain pricing and plans
- Update payment information

Be helpful and ensure customer satisfaction.`,

  tools: [
    tool({
      name: "get_billing_info",
      description: "Get billing information for the current customer",
      parameters: z.object({}),
      execute: async (_, ctx) => {
        return {
          plan: ctx.context.customerTier,
          nextBillingDate: "15/02/2025",
          amount: ctx.context.customerTier === "free" ? 0 : 99,
          currency: "AUD",
        };
      },
    }),
    tool({
      name: "process_refund",
      description: "Process a refund request",
      parameters: z.object({
        reason: z.string().describe("Reason for refund"),
        amount: z.number().optional().describe("Refund amount (optional for full refund)"),
      }),
      execute: async ({ reason, amount }, ctx) => {
        if (ctx.context.customerTier === "free") {
          return { success: false, message: "No billing history for free tier" };
        }
        return {
          success: true,
          refundId: `REF-${Date.now().toString(36).toUpperCase()}`,
          reason,
          amount: amount || 99,
          status: "processing",
          estimatedDays: 5,
        };
      },
    }),
  ],
});

/**
 * Sales Agent
 * Handles sales inquiries and upgrades
 */
export const salesAgent = Agent.create<SupportContext, string>({
  name: "Sales",
  instructions: (ctx) => `You are a sales representative.

Current Customer Tier: ${ctx.customerTier}

Your responsibilities:
- Answer questions about plans and pricing
- Recommend appropriate plans
- Process upgrades
- Explain features and benefits

Be persuasive but not pushy.`,

  tools: [
    tool({
      name: "get_pricing",
      description: "Get pricing information for all plans",
      parameters: z.object({}),
      execute: async () => {
        return {
          plans: [
            { name: "Free", price: 0, features: ["Basic features", "Community support"] },
            { name: "Pro", price: 99, features: ["All Free features", "Priority support", "Advanced analytics"] },
            { name: "Enterprise", price: 499, features: ["All Pro features", "Dedicated support", "Custom integrations", "SLA"] },
          ],
          currency: "AUD/month",
          gstIncluded: true,
        };
      },
    }),
    tool({
      name: "process_upgrade",
      description: "Process a plan upgrade",
      parameters: z.object({
        newPlan: z.enum(["pro", "enterprise"]).describe("Plan to upgrade to"),
      }),
      execute: async ({ newPlan }, ctx) => {
        return {
          success: true,
          previousPlan: ctx.context.customerTier,
          newPlan,
          effectiveDate: new Date().toISOString(),
          prorated: true,
        };
      },
    }),
  ],
});

// ============================================================================
// Pattern 1: Manager Pattern (Agent as Tool)
// ============================================================================

/**
 * Manager Agent that orchestrates specialized agents
 */
export const managerAgent = Agent.create<SupportContext, string>({
  name: "SupportManager",
  instructions: `You are a support manager who coordinates specialized agents.

Available specialists:
- TechnicalSupport: For technical issues, bugs, and troubleshooting
- BillingSupport: For billing, payments, and refunds
- Sales: For pricing, plans, and upgrades

Analyze the customer's request and delegate to the appropriate specialist.
You can call multiple specialists if needed.
Summarize the responses for the customer.`,

  tools: [
    agentAsTool(technicalSupportAgent),
    agentAsTool(billingSupportAgent),
    agentAsTool(salesAgent),
  ],

  maxTurns: 15,
});

// ============================================================================
// Pattern 2: Handoffs
// ============================================================================

/**
 * Triage Agent with handoffs to specialists
 */
export const triageAgent = Agent.create<SupportContext, string>({
  name: "Triage",
  instructions: `You are a triage agent who routes customers to the right specialist.

Analyze the customer's request and hand off to the appropriate agent:
- Technical issues → TechnicalSupport
- Billing/refunds → BillingSupport
- Pricing/upgrades → Sales

If unclear, ask clarifying questions before handing off.`,

  handoffs: [
    handoff({
      targetAgent: technicalSupportAgent,
      description: "Hand off to technical support for technical issues and troubleshooting",
      filter: (input) => {
        const techKeywords = ["bug", "error", "broken", "crash", "not working", "issue", "problem"];
        return techKeywords.some((kw) => input.reason.toLowerCase().includes(kw));
      },
    }),
    handoff({
      targetAgent: billingSupportAgent,
      description: "Hand off to billing support for billing and payment issues",
      filter: (input) => {
        const billingKeywords = ["bill", "payment", "refund", "charge", "invoice", "subscription"];
        return billingKeywords.some((kw) => input.reason.toLowerCase().includes(kw));
      },
    }),
    handoff({
      targetAgent: salesAgent,
      description: "Hand off to sales for pricing and upgrade inquiries",
      filter: (input) => {
        const salesKeywords = ["price", "pricing", "upgrade", "plan", "features", "enterprise"];
        return salesKeywords.some((kw) => input.reason.toLowerCase().includes(kw));
      },
    }),
  ],
});

// ============================================================================
// Pattern 3: Router
// ============================================================================

/**
 * Create a router for automatic agent selection
 */
export const supportRouter = createRouter<SupportContext>({
  agents: [technicalSupportAgent, billingSupportAgent, salesAgent],
  selector: keywordSelector({
    // Technical keywords
    bug: technicalSupportAgent,
    error: technicalSupportAgent,
    crash: technicalSupportAgent,
    broken: technicalSupportAgent,
    // Billing keywords
    bill: billingSupportAgent,
    refund: billingSupportAgent,
    payment: billingSupportAgent,
    invoice: billingSupportAgent,
    // Sales keywords
    price: salesAgent,
    pricing: salesAgent,
    upgrade: salesAgent,
    plan: salesAgent,
  }),
  defaultAgent: triageAgent,
});

// ============================================================================
// Pattern 4: Chain
// ============================================================================

/**
 * Example of chained agent execution
 * First diagnose, then provide solution, then follow up
 */
export async function runDiagnosticChain(
  input: string,
  ctx: SupportContext
): Promise<{
  diagnosis: string;
  solution: string;
  followUp: string;
}> {
  const diagnosisAgent = Agent.create<SupportContext, string>({
    name: "Diagnosis",
    instructions: "Analyze the issue and provide a diagnosis. Be concise.",
  });

  const solutionAgent = Agent.create<SupportContext, string>({
    name: "Solution",
    instructions: "Based on the diagnosis, provide step-by-step solution. Be practical.",
  });

  const followUpAgent = Agent.create<SupportContext, string>({
    name: "FollowUp",
    instructions: "Provide follow-up recommendations and preventive measures.",
  });

  const result = await executeChain(
    {
      agents: [diagnosisAgent, solutionAgent, followUpAgent],
      transform: (output, index) => {
        if (index === 0) return `Diagnosis: ${output}\n\nProvide solution:`;
        if (index === 1) return `${output}\n\nProvide follow-up recommendations:`;
        return output;
      },
    },
    input,
    ctx
  );

  return {
    diagnosis: result.outputs[0],
    solution: result.outputs[1],
    followUp: result.outputs[2],
  };
}

// ============================================================================
// Pattern 5: Parallel Execution
// ============================================================================

/**
 * Example of parallel agent execution
 * Get perspectives from multiple specialists simultaneously
 */
export async function getMultiplePerspectives(
  input: string,
  ctx: SupportContext
): Promise<{
  technical: string;
  business: string;
  customer: string;
  combined: string;
}> {
  const technicalPerspective = Agent.create<SupportContext, string>({
    name: "TechnicalPerspective",
    instructions: "Analyze from a technical standpoint. Focus on implementation.",
  });

  const businessPerspective = Agent.create<SupportContext, string>({
    name: "BusinessPerspective",
    instructions: "Analyze from a business standpoint. Focus on ROI and value.",
  });

  const customerPerspective = Agent.create<SupportContext, string>({
    name: "CustomerPerspective",
    instructions: "Analyze from customer standpoint. Focus on user experience.",
  });

  const result = await executeParallel(
    {
      agents: [technicalPerspective, businessPerspective, customerPerspective],
      aggregate: (results) => {
        const parts: string[] = [];
        for (const [name, output] of results) {
          parts.push(`**${name}**: ${output}`);
        }
        return parts.join("\n\n");
      },
      timeout: 30000,
    },
    input,
    ctx
  );

  return {
    technical: result.results.get("TechnicalPerspective") || "",
    business: result.results.get("BusinessPerspective") || "",
    customer: result.results.get("CustomerPerspective") || "",
    combined: result.aggregatedOutput,
  };
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Using the Manager Pattern
 *
 * ```typescript
 * const ctx = createSupportContext({ customerTier: 'pro' });
 * const runner = createRunner({ modelProvider });
 *
 * const result = await runner.run(
 *   managerAgent,
 *   "I'm having a technical issue and also want to know about upgrading to enterprise",
 *   { context: ctx }
 * );
 * ```
 *
 * Example 2: Using Handoffs
 *
 * ```typescript
 * const result = await runner.run(
 *   triageAgent,
 *   "The app keeps crashing when I try to export",
 *   { context: ctx }
 * );
 * // Will hand off to TechnicalSupport
 * ```
 *
 * Example 3: Using Router
 *
 * ```typescript
 * const selectedAgent = await supportRouter.route("I want a refund", ctx);
 * // Returns billingSupportAgent
 * ```
 *
 * Example 4: Chain Execution
 *
 * ```typescript
 * const result = await runDiagnosticChain("The export feature is slow", ctx);
 * console.log(result.diagnosis);
 * console.log(result.solution);
 * console.log(result.followUp);
 * ```
 *
 * Example 5: Parallel Execution
 *
 * ```typescript
 * const perspectives = await getMultiplePerspectives(
 *   "Should we add a dark mode feature?",
 *   ctx
 * );
 * console.log(perspectives.combined);
 * ```
 */
