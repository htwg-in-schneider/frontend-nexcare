import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchPatientenByKlinikum(klinikumId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/klinikum/${klinikumId}`, { ...opts })
  if (!res.ok) throw new Error('Fehler beim Laden der Bettenbelegung')
  return res.json()
}
