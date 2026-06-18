import { apiFetch } from './apiClient.js'

export async function fetchUsers() {
  return apiFetch('/api/admin/users')
}

export async function fetchUser(id) {
  return apiFetch(`/api/admin/users/${id}`)
}

export async function updateUser(id, data) {
  return apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
