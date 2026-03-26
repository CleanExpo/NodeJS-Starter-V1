/**
 * Proxy Auth Helper
 *
 * Server-side utility for Next.js API routes that proxy requests to the
 * FastAPI backend. Reads the httpOnly auth_token cookie, verifies it
 * with the backend, and returns headers ready to forward.
 *
 * Usage:
 *   const auth = await getProxyAuth();
 *   if (!auth) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
 *   const res = await fetch(url, { headers: auth.headers });
 */

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export interface ProxyAuthResult {
  /** Headers to forward to the backend (Authorization + Content-Type) */
  headers: Record<string, string>;
  /** The authenticated user's ID */
  userId: string;
  /** The raw JWT token */
  token: string;
}

/**
 * Read the auth cookie, verify with the backend, and return forwarding headers.
 * Returns null if the user is not authenticated.
 */
export async function getProxyAuth(): Promise<ProxyAuthResult | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const meResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!meResponse.ok) {
      return null;
    }

    const user = await meResponse.json();

    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      userId: user.id,
      token,
    };
  } catch {
    return null;
  }
}
