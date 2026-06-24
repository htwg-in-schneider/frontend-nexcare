export async function throwApiError(res) {
  let message = `HTTP ${res.status}`
  let fieldErrors = null
  try {
    const body = await res.json()
    message = body.fehler ?? body.message ?? body.error ?? message
    if (body.felder && Array.isArray(body.felder)) {
      fieldErrors = body.felder
      message = body.felder.map(f => f.meldung).join(', ')
    }
  } catch {
    // response body is not JSON
  }
  const err = new Error(message)
  err.fieldErrors = fieldErrors
  throw err
}
