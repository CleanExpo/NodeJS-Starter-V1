/**
 * Supabase Server Client for Nutrition Module
 *
 * Provides direct Supabase DB access for nutrition API routes.
 * Auth is handled via the FastAPI JWT cookie (auth_token), not Supabase Auth.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwwwhoaxxtkmowifpuwf.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3d3dob2F4eHRrbW93aWZwdXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2Mzc0MzIsImV4cCI6MjA4MDIxMzQzMn0.FvyEwEuBdnPE0K2IomLiZFmlDuR3gf4vasEjhHcOu4Q';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface FastAPIUser {
  id: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

/**
 * Get current user from FastAPI backend via JWT cookie.
 * Returns user object compatible with Supabase auth.getUser() shape.
 */
async function getCurrentUser(): Promise<{
  data: { user: { id: string; email: string } | null };
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { data: { user: null } };
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { data: { user: null } };
    }

    const user: FastAPIUser = await response.json();
    return { data: { user: { id: user.id, email: user.email } } };
  } catch {
    return { data: { user: null } };
  }
}

/**
 * Create a Supabase client with auth compatibility layer.
 *
 * - `.from()`, `.select()`, `.eq()`, etc. use the real Supabase client
 * - `.auth.getUser()` reads the FastAPI JWT cookie and validates via backend
 */
export async function createClient() {
  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Attach auth compatibility layer
  const client = Object.create(supabase);
  client.auth = {
    getUser: getCurrentUser,
  };

  return client;
}
