import { authHeaders } from './auth.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchKlinika(name = '') {
  const qs = name ? `?name=${encodeURIComponent(name)}` : ''
  const res = await fetch(`${BASE_URL}/api/klinikum${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function createKlinikum(klinikum) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/klinikum`, {
    method: 'POST',
    ...opts,
    body: JSON.stringify(klinikum),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateKlinikum(id, klinikum) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/klinikum/${id}`, {
    method: 'PUT',
    ...opts,
    body: JSON.stringify(klinikum),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteKlinikum(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/klinikum/${id}`, { method: 'DELETE', ...opts })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
