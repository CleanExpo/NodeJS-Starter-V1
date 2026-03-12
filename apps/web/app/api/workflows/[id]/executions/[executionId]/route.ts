import { NextRequest, NextResponse } from 'next/server';
import { getProxyAuth } from '@/lib/api/proxy-auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; executionId: string }> }
) {
  try {
    const auth = await getProxyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { id, executionId } = await params;

    const response = await fetch(`${BACKEND_URL}/api/workflows/${id}/executions/${executionId}`, {
      headers: auth.headers,
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching execution detail:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch execution detail' }, { status: 500 });
  }
}
