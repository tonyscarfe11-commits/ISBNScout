/**
 * CSRF Token Management
 *
 * Fetches and caches CSRF tokens for API requests
 */

let csrfToken: string | null = null;

/**
 * Fetch a CSRF token from the server
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }

  try {
    // Fetch token from the server - any GET request will include it in the header
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    // Extract token from response header
    const token = response.headers.get('X-CSRF-Token');

    if (token) {
      csrfToken = token;
      return token;
    }

    console.warn('[CSRF] No token received from server');
    return '';
  } catch (error) {
    console.error('[CSRF] Failed to fetch token:', error);
    return '';
  }
}

/**
 * Clear the cached CSRF token (call this on logout or token expiry)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/**
 * Add CSRF token to fetch headers
 */
export async function addCsrfHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
  const token = await getCsrfToken();

  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  }

  return headers;
}
