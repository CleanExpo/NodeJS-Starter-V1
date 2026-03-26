import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from '@/lib/api/auth';

// Mock the apiClient module
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api/client';

const mockApiClient = vi.mocked(apiClient);

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
    it('returns token and user on success (200)', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
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

      expect(result.access_token).toBe('test-token');
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

    it('throws generic "Login failed" when error response has no message', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('', { status: 401 })));

      await expect(authApi.login({ email: 'bad@example.com', password: 'wrong' })).rejects.toThrow(
        'Login failed'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getCurrentUser
  // ---------------------------------------------------------------------------

  describe('getCurrentUser', () => {
    it('returns User when apiClient.get resolves', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@local.dev',
        is_active: true,
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce(mockUser);

      const result = await authApi.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/me');
    });

    it('returns null when apiClient.get throws (unauthenticated)', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('401 Unauthorized'));

      const result = await authApi.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------

  describe('logout', () => {
    it('calls both backend logout and cookie-clearing route', async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      await authApi.logout();

      // apiClient.post called for backend logout
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/logout');
      // fetch called for cookie-clearing route
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('still clears cookie even if backend logout fails', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Backend unreachable'));

      const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      // Should not throw
      await expect(authApi.logout()).resolves.toBeUndefined();

      // Cookie-clearing route still called
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
