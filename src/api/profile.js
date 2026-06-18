import { apiFetch } from './apiClient.js'

export async function fetchProfile() {
  return apiFetch('/api/profile')
}

export async function fetchMeinPatient() {
  return apiFetch('/api/profile/mein-patient')
}

export async function updateProfile(data) {
  return apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) })
}
