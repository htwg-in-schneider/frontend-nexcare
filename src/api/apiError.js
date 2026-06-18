/**
 * Parses a failed API response and throws an Error with the backend's
 * "fehler" message (if JSON) or a generic HTTP status message.
 */
export async function throwApiError(res) {
  let message = `HTTP ${res.status}`
  try {
    const body = await res.json()
    message = body.fehler ?? body.message ?? body.error ?? message
  } catch {
    // response body is not JSON — keep generic message
  }
  throw new Error(message)
}
