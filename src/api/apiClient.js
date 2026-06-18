import { authHeaders } from './auth.js'
import { throwApiError } from './apiError.js'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

/**
 * Authenticated fetch wrapper. Merges auth headers automatically,
 * parses the response as JSON on success, and throws a backend-aware
 * error on non-ok responses.
 *
 * @param {string} path   — e.g. '/api/patient/1'
 * @param {RequestInit} [init] — standard fetch options (method, body, …)
 * @returns {Promise<any>} — parsed JSON body (or undefined for 204)
 */
export async function apiFetch(path, init = {}) {
  const auth = await authHeaders()
  const res = await fetch(`${BASE_URL}${path}`, { ...auth, ...init })
  if (!res.ok) await throwApiError(res)
  if (res.status === 204) return undefined
  return res.json()
}
