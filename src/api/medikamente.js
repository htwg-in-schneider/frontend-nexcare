import { apiFetch } from './apiClient.js'

export async function fetchMedikamente(suche = '') {
  const qs = suche ? `?suche=${encodeURIComponent(suche)}` : ''
  return apiFetch(`/api/medikament${qs}`)
}

export async function createMedikament(data) {
  return apiFetch('/api/medikament', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateMedikament(id, data) {
  return apiFetch(`/api/medikament/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function archiviereMedikament(id) {
  await apiFetch(`/api/medikament/${id}`, { method: 'DELETE' })
}

export async function fetchMedikamentenplan(patientId) {
  return apiFetch(`/api/patient/${patientId}/medikamentenplan`)
}

export async function addMedikamentenEintrag(patientId, eintrag) {
  return apiFetch(`/api/patient/${patientId}/medikamentenplan`, {
    method: 'POST',
    body: JSON.stringify(eintrag),
  })
}

export async function deleteMedikamentenEintrag(patientId, eintragId) {
  await apiFetch(`/api/patient/${patientId}/medikamentenplan/${eintragId}`, { method: 'DELETE' })
}
