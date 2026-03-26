import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from '@/lib/logger';

/**
 * Verify HMAC-SHA256 webhook signature.
 * Returns true if the signature is valid or if no secret is configured (dev mode).
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  // Constant-time comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(expected, 'utf-8'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    // Validate webhook signature
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        logger.warn('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      logger.error('WEBHOOK_SECRET not configured in production');
      return NextResponse.json({ error: 'Webhook validation not configured' }, { status: 500 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    switch (event) {
      case 'task.completed':
        logger.info('Task completed', { data });
        break;
      case 'task.failed':
        logger.warn('Task failed', { data });
        break;
      case 'agent.status':
        logger.info('Agent status update', { data });
        break;
      default:
        logger.warn('Unknown webhook event', { event, data });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
