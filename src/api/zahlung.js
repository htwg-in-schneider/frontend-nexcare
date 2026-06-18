import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchEigenanteil() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/portal/eigenanteil`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function bezahlen() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/portal/zahlung`, {
    method: 'POST',
    ...opts,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
