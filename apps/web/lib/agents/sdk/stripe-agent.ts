/**
 * Stripe SDK Agent
 *
 * Handles Stripe payment integration tasks:
 * - Create and manage products/prices
 * - Handle subscriptions
 * - Process payments and refunds
 * - Manage customers
 * - Generate checkout sessions
 * - Handle webhooks
 */

import { z } from "zod";
import { Agent, tool } from "../core";
import type { SDKContext, SDKAgentInfo, ToolResponse } from "./types";
import { success, error, getCredential } from "./types";

// ============================================================================
// Agent Info
// ============================================================================

export const stripeAgentInfo: SDKAgentInfo = {
  type: "stripe",
  name: "Stripe",
  description: "Payment processing, subscriptions, and billing management",
  keywords: [
    "payment",
    "stripe",
    "subscription",
    "billing",
    "checkout",
    "invoice",
    "refund",
    "customer",
    "price",
    "product",
    "webhook",
  ],
  requiredCredentials: ["secretKey"],
  optionalCredentials: ["publishableKey", "webhookSecret"],
};

// ============================================================================
// Helper Functions
// ============================================================================

async function stripeRequest(
  ctx: SDKContext,
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<ToolResponse> {
  const secretKey = getCredential(ctx, "stripe", "secretKey");
  if (!secretKey) {
    return error("Stripe secret key not configured", "MISSING_CREDENTIALS");
  }

  try {
    const url = `https://api.stripe.com/v1/${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const options: RequestInit = { method, headers };

    if (body && method === "POST") {
      const formBody = new URLSearchParams();
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            // Handle nested objects like metadata[key]
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
              formBody.append(`${key}[${nestedKey}]`, String(nestedValue));
            }
          } else {
            formBody.append(key, String(value));
          }
        }
      }
      options.body = formBody.toString();
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return error(
        data.error?.message || "Stripe API error",
        data.error?.code,
        data.error
      );
    }

    return success(data);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Stripe request failed",
      "REQUEST_FAILED"
    );
  }
}

// ============================================================================
// Tools
// ============================================================================

export const listProductsTool = tool<
  z.ZodObject<{ limit: z.ZodOptional<z.ZodNumber>; active: z.ZodOptional<z.ZodBoolean> }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_list_products",
  description: "List all Stripe products",
  parameters: z.object({
    limit: z.number().min(1).max(100).optional().describe("Max results (default 10)"),
    active: z.boolean().optional().describe("Filter by active status"),
  }),
  execute: async ({ limit = 10, active }, ctx) => {
    let endpoint = `products?limit=${limit}`;
    if (active !== undefined) endpoint += `&active=${active}`;
    return stripeRequest(ctx.context, endpoint);
  },
});

export const createProductTool = tool<
  z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_create_product",
  description: "Create a new Stripe product",
  parameters: z.object({
    name: z.string().describe("Product name"),
    description: z.string().optional().describe("Product description"),
    metadata: z.record(z.string()).optional().describe("Custom metadata"),
  }),
  execute: async (input, ctx) => {
    return stripeRequest(ctx.context, "products", "POST", input);
  },
});

export const createPriceTool = tool<
  z.ZodObject<{
    product: z.ZodString;
    unitAmount: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    recurring: z.ZodOptional<z.ZodObject<{
      interval: z.ZodEnum<["day", "week", "month", "year"]>;
      intervalCount: z.ZodOptional<z.ZodNumber>;
    }>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_create_price",
  description: "Create a price for a product",
  parameters: z.object({
    product: z.string().describe("Product ID"),
    unitAmount: z.number().describe("Price in cents (e.g., 1000 = $10.00)"),
    currency: z.string().optional().describe("Currency code (default: aud)"),
    recurring: z
      .object({
        interval: z.enum(["day", "week", "month", "year"]).describe("Billing interval"),
        intervalCount: z.number().optional().describe("Interval count"),
      })
      .optional()
      .describe("Recurring billing settings"),
  }),
  execute: async ({ product, unitAmount, currency = "aud", recurring }, ctx) => {
    const body: Record<string, unknown> = {
      product,
      unit_amount: unitAmount,
      currency,
    };
    if (recurring) {
      body["recurring[interval]"] = recurring.interval;
      if (recurring.intervalCount) {
        body["recurring[interval_count]"] = recurring.intervalCount;
      }
    }
    return stripeRequest(ctx.context, "prices", "POST", body);
  },
});

export const createCustomerTool = tool<
  z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_create_customer",
  description: "Create a new Stripe customer",
  parameters: z.object({
    email: z.string().email().describe("Customer email"),
    name: z.string().optional().describe("Customer name"),
    phone: z.string().optional().describe("Phone number"),
    metadata: z.record(z.string()).optional().describe("Custom metadata"),
  }),
  execute: async (input, ctx) => {
    return stripeRequest(ctx.context, "customers", "POST", input);
  },
});

export const createCheckoutSessionTool = tool<
  z.ZodObject<{
    priceId: z.ZodString;
    mode: z.ZodEnum<["payment", "subscription", "setup"]>;
    successUrl: z.ZodString;
    cancelUrl: z.ZodString;
    customerId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_create_checkout_session",
  description: "Create a Stripe Checkout session for payment",
  parameters: z.object({
    priceId: z.string().describe("Price ID to charge"),
    mode: z.enum(["payment", "subscription", "setup"]).describe("Checkout mode"),
    successUrl: z.string().url().describe("URL after successful payment"),
    cancelUrl: z.string().url().describe("URL if payment cancelled"),
    customerId: z.string().optional().describe("Existing customer ID"),
    quantity: z.number().optional().describe("Quantity (default 1)"),
  }),
  execute: async ({ priceId, mode, successUrl, cancelUrl, customerId, quantity = 1 }, ctx) => {
    const body: Record<string, unknown> = {
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": quantity,
    };
    if (customerId) body.customer = customerId;
    return stripeRequest(ctx.context, "checkout/sessions", "POST", body);
  },
});

export const createSubscriptionTool = tool<
  z.ZodObject<{
    customerId: z.ZodString;
    priceId: z.ZodString;
    trialPeriodDays: z.ZodOptional<z.ZodNumber>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_create_subscription",
  description: "Create a subscription for a customer",
  parameters: z.object({
    customerId: z.string().describe("Customer ID"),
    priceId: z.string().describe("Recurring price ID"),
    trialPeriodDays: z.number().optional().describe("Trial period in days"),
  }),
  execute: async ({ customerId, priceId, trialPeriodDays }, ctx) => {
    const body: Record<string, unknown> = {
      customer: customerId,
      "items[0][price]": priceId,
    };
    if (trialPeriodDays) body.trial_period_days = trialPeriodDays;
    return stripeRequest(ctx.context, "subscriptions", "POST", body);
  },
});

export const cancelSubscriptionTool = tool<
  z.ZodObject<{
    subscriptionId: z.ZodString;
    immediately: z.ZodOptional<z.ZodBoolean>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_cancel_subscription",
  description: "Cancel a subscription",
  parameters: z.object({
    subscriptionId: z.string().describe("Subscription ID to cancel"),
    immediately: z.boolean().optional().describe("Cancel immediately vs at period end"),
  }),
  execute: async ({ subscriptionId, immediately = false }, ctx) => {
    if (immediately) {
      return stripeRequest(ctx.context, `subscriptions/${subscriptionId}`, "DELETE");
    }
    return stripeRequest(ctx.context, `subscriptions/${subscriptionId}`, "POST", {
      cancel_at_period_end: true,
    });
  },
});

export const createRefundTool = tool<
  z.ZodObject<{
    paymentIntentId: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodEnum<["duplicate", "fraudulent", "requested_by_customer"]>>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_create_refund",
  description: "Refund a payment",
  parameters: z.object({
    paymentIntentId: z.string().describe("Payment Intent ID to refund"),
    amount: z.number().optional().describe("Partial refund amount in cents"),
    reason: z
      .enum(["duplicate", "fraudulent", "requested_by_customer"])
      .optional()
      .describe("Refund reason"),
  }),
  execute: async ({ paymentIntentId, amount, reason }, ctx) => {
    const body: Record<string, unknown> = { payment_intent: paymentIntentId };
    if (amount) body.amount = amount;
    if (reason) body.reason = reason;
    return stripeRequest(ctx.context, "refunds", "POST", body);
  },
});

export const getBalanceTool = tool<
  z.ZodObject<Record<string, never>>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_get_balance",
  description: "Get current Stripe account balance",
  parameters: z.object({}),
  execute: async (_, ctx) => {
    return stripeRequest(ctx.context, "balance");
  },
});

export const listPaymentsTool = tool<
  z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    customerId: z.ZodOptional<z.ZodString>;
  }>,
  ToolResponse,
  SDKContext
>({
  name: "stripe_list_payments",
  description: "List recent payment intents",
  parameters: z.object({
    limit: z.number().min(1).max(100).optional().describe("Max results"),
    customerId: z.string().optional().describe("Filter by customer"),
  }),
  execute: async ({ limit = 10, customerId }, ctx) => {
    let endpoint = `payment_intents?limit=${limit}`;
    if (customerId) endpoint += `&customer=${customerId}`;
    return stripeRequest(ctx.context, endpoint);
  },
});

// ============================================================================
// Stripe Agent
// ============================================================================

export const stripeAgent = Agent.create<SDKContext, string>({
  name: "StripeAgent",
  instructions: (ctx) => `You are a Stripe payment integration specialist.

Environment: ${ctx.environment}
${ctx.project ? `Project: ${ctx.project.name}` : ""}

You help with:
1. Creating and managing products and prices
2. Setting up subscriptions and billing
3. Processing payments and refunds
4. Managing customers
5. Creating checkout sessions
6. Handling webhooks

Best Practices:
- Always use the smallest unit for currency (cents for AUD)
- Default currency is AUD (Australian Dollars)
- Include GST in pricing (10% for Australia)
- Use metadata for tracking custom data
- For subscriptions, recommend starting with a trial period
- Always validate webhook signatures in production

Security:
- Never expose the secret key in client-side code
- Use Stripe Checkout for PCI compliance
- Validate all amounts server-side`,

  tools: [
    listProductsTool,
    createProductTool,
    createPriceTool,
    createCustomerTool,
    createCheckoutSessionTool,
    createSubscriptionTool,
    cancelSubscriptionTool,
    createRefundTool,
    getBalanceTool,
    listPaymentsTool,
  ],

  maxTurns: 15,
  temperature: 0.3,
});
