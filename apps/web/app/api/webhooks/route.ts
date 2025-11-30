import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const signature = headersList.get("x-webhook-signature");

    // Validate webhook signature if configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      // Add your signature validation logic here
      // Example: const isValid = validateSignature(body, signature, webhookSecret);
    }

    const body = await request.json();
    const { event, data } = body;

    switch (event) {
      case "task.completed":
        console.log("Task completed:", data);
        break;
      case "task.failed":
        console.log("Task failed:", data);
        break;
      case "agent.status":
        console.log("Agent status update:", data);
        break;
      default:
        console.log("Unknown webhook event:", event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
