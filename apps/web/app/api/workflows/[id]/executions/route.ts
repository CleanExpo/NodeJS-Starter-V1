import { NextRequest, NextResponse } from 'next/server';
import { getProxyAuth } from '@/lib/api/proxy-auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getProxyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';

    const response = await fetch(`${BACKEND_URL}/api/workflows/${id}/executions?limit=${limit}`, {
      headers: auth.headers,
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching execution history:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch execution history' }, { status: 500 });
  }
}
