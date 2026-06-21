import { apiFetch } from './apiClient.js'

export async function fetchEigenanteil() {
  return apiFetch('/api/portal/eigenanteil')
}

export async function bezahlen() {
  return apiFetch('/api/portal/zahlung', { method: 'POST' })
}
