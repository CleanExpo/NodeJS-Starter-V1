import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from '@/lib/api/auth';

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------

  describe('login', () => {
    it('returns success and user on success (200)', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 'user-1',
          email: 'admin@local.dev',
          is_active: true,
          is_admin: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }))
      );

      const result = await authApi.login({ email: 'admin@local.dev', password: 'admin123' });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('admin@local.dev');
    });

    it('throws Error with server message on 400 invalid credentials', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 400 })
          )
      );

      await expect(authApi.login({ email: 'bad@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('throws generic fallback message when error body has no message field', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 401 }))
      );

      await expect(authApi.login({ email: 'bad@example.com', password: 'wrong' })).rejects.toThrow(
        'Request failed (401)'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getCurrentUser
  // ---------------------------------------------------------------------------

  describe('getCurrentUser', () => {
    it('returns User when the request resolves (200)', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@local.dev',
        is_active: true,
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(mockUser), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      const result = await authApi.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/me',
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('returns null when the request fails (401 unauthenticated)', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
          )
      );

      const result = await authApi.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------

  describe('logout', () => {
    it('POSTs to the cookie-clearing logout route', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      await authApi.logout();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      );
    });
  });
});
