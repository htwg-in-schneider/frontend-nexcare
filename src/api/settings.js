import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchSettings() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/admin/settings`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateSetting(key, value) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/admin/settings/${encodeURIComponent(key)}`, {
    method: 'PUT',
    ...opts,
    body: JSON.stringify({ value }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
