import { apiFetch } from './apiClient.js'

export async function fetchPatientenByKlinikum(klinikumId) {
  return apiFetch(`/api/patient?klinikum=${klinikumId}`)
}

export async function fetchBettStruktur(klinikumId) {
  return apiFetch(`/api/betten/struktur?klinikumId=${klinikumId}`)
}

export async function createEtage(klinikumId, nummer, bezeichnung) {
  return apiFetch('/api/betten/etage', {
    method: 'POST',
    body: JSON.stringify({ klinikumId, nummer, bezeichnung }),
  })
}

export async function deleteEtage(id) {
  await apiFetch(`/api/betten/etage/${id}`, { method: 'DELETE' })
}

export async function createZimmer(etageId, nummer, abteilung, station) {
  return apiFetch('/api/betten/zimmer', {
    method: 'POST',
    body: JSON.stringify({ etageId, nummer, abteilung, station }),
  })
}

export async function deleteZimmer(id) {
  await apiFetch(`/api/betten/zimmer/${id}`, { method: 'DELETE' })
}

export async function createBett(zimmerId, bezeichnung) {
  return apiFetch('/api/betten/bett', {
    method: 'POST',
    body: JSON.stringify({ zimmerId, bezeichnung }),
  })
}

export async function deleteBett(id) {
  await apiFetch(`/api/betten/bett/${id}`, { method: 'DELETE' })
}

export async function assignPatientToBett(bettId, patientId) {
  return apiFetch(`/api/betten/bett/${bettId}/assign/${patientId}`, { method: 'PUT' })
}

export async function releaseBett(bettId) {
  return apiFetch(`/api/betten/bett/${bettId}/release`, { method: 'PUT' })
}

export async function updateBettStatus(bettId, status) {
  return apiFetch(`/api/betten/bett/${bettId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}
