import { apiFetch, BASE_URL } from './apiClient.js'

export async function fetchKlinika(name = '') {
  const qs = name ? `?name=${encodeURIComponent(name)}` : ''
  const res = await fetch(`${BASE_URL}/api/klinikum${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function createKlinikum(klinikum) {
  return apiFetch('/api/klinikum', { method: 'POST', body: JSON.stringify(klinikum) })
}

export async function updateKlinikum(id, klinikum) {
  return apiFetch(`/api/klinikum/${id}`, { method: 'PUT', body: JSON.stringify(klinikum) })
}

export async function deleteKlinikum(id) {
  await apiFetch(`/api/klinikum/${id}`, { method: 'DELETE' })
}
