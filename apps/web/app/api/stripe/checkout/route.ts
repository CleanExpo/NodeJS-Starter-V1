import { NextRequest, NextResponse } from 'next/server';
import { getProxyAuth } from '@/lib/api/proxy-auth';
import { createCheckoutSession } from '@/lib/api/stripe';

export async function POST(request: NextRequest) {
  try {
    const auth = await getProxyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, mode = 'subscription', successUrl, cancelUrl } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl || `${appUrl}/dashboard/billing?success=true`,
      cancel_url: cancelUrl || `${appUrl}/dashboard/billing?cancelled=true`,
      metadata: { userId: auth.userId },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stripe checkout error:', error);
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
