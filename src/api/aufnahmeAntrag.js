import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchMeinAntrag() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/portal/aufnahme-antrag`, opts)
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function submitAntrag(data) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/portal/aufnahme-antrag`, {
    method: 'POST',
    ...opts,
    body: JSON.stringify(data),
  })
  if (res.status === 409) throw new Error('DUPLICATE')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchOffeneAntraege() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/aufnahme-antraege`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function bestaetigen(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/aufnahme-antraege/${id}/bestaetigen`, { method: 'POST', ...opts })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function ablehnen(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/aufnahme-antraege/${id}/ablehnen`, { method: 'POST', ...opts })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
