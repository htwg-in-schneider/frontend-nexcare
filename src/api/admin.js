import { authHeaders } from './auth.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchUsers() {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/admin/users`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchUser(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateUser(id, data) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    ...opts,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
