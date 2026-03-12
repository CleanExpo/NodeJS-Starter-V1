/**
 * CSRF protection utilities.
 * Reads the csrf_token cookie and provides it for mutation requests.
 */

/**
 * Extract CSRF token from cookies.
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.split('; ').find((row) => row.startsWith('csrf_token='));

  return match ? (match.split('=')[1] ?? null) : null;
}

/**
 * Get headers with CSRF token attached.
 * Use this for POST/PUT/PATCH/DELETE requests.
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { 'x-csrf-token': token } : {};
}
