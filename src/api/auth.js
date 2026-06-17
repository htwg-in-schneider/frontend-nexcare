import { useAuth0 } from '@auth0/auth0-vue'

/**
 * Returns fetch options with Authorization header if user is authenticated.
 * Falls back to no auth header for public endpoints.
 */
export async function authHeaders(extraHeaders = {}) {
  try {
    const { getAccessTokenSilently } = useAuth0()
    const token = await getAccessTokenSilently()
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
      },
    }
  } catch {
    return { headers: { 'Content-Type': 'application/json', ...extraHeaders } }
  }
}
