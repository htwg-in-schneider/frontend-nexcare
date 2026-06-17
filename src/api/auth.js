/**
 * Module-level token getter set once from App.vue after auth0 initializes.
 * Avoids calling useAuth0() outside Vue component setup context.
 */
let _getToken = null

export function setTokenGetter(fn) {
  _getToken = fn
}

export async function authHeaders(extraHeaders = {}) {
  const base = { 'Content-Type': 'application/json', ...extraHeaders }
  if (!_getToken) return { headers: base }
  try {
    const token = await _getToken()
    return { headers: { ...base, Authorization: `Bearer ${token}` } }
  } catch {
    return { headers: base }
  }
}
