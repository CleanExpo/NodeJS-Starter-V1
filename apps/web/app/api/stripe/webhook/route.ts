import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/api/stripe';
import type { Stripe } from '@/lib/api/stripe';

/**
 * Stripe webhook handler — verifies signatures and processes events.
 * This route does NOT require user auth — it's called by Stripe directly.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(rawBody, signature);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (process.env.NODE_ENV === 'development') {
          console.log('Checkout completed:', session.id);
        }
        // TODO: Provision access, update user subscription in database
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        if (process.env.NODE_ENV === 'development') {
          console.log(`Subscription ${event.type}:`, subscription.id);
        }
        // TODO: Update subscription status in database
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (process.env.NODE_ENV === 'development') {
          console.log('Payment failed:', invoice.id);
        }
        // TODO: Notify user of failed payment
        break;
      }

      default:
        if (process.env.NODE_ENV === 'development') {
          console.log(`Unhandled Stripe event: ${event.type}`);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stripe webhook error:', error);
    }
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
