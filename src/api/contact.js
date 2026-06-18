import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function sendContact(data) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    ...opts,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
