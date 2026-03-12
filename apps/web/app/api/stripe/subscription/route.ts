import { NextRequest, NextResponse } from 'next/server';
import { getProxyAuth } from '@/lib/api/proxy-auth';
import { listSubscriptions } from '@/lib/api/stripe';

export async function GET(request: NextRequest) {
  try {
    const auth = await getProxyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId query parameter is required' },
        { status: 400 }
      );
    }

    const subscriptions = await listSubscriptions(customerId);

    return NextResponse.json({
      subscriptions: subscriptions.data,
      hasMore: subscriptions.has_more,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stripe subscription error:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
