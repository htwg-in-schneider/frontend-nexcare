import { authHeaders } from './auth.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchProfile() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/profile`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchMeinPatient() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/profile/mein-patient`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateProfile(data) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    ...opts,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
