import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function fetchPatientenByKlinikum(klinikumId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/klinikum/${klinikumId}`, { ...opts })
  if (!res.ok) throw new Error('Fehler beim Laden der Bettenbelegung')
  return res.json()
}

export async function fetchBettStruktur(klinikumId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/struktur?klinikumId=${klinikumId}`, { ...opts })
  if (!res.ok) throw new Error('Fehler beim Laden der Bettstruktur')
  return res.json()
}

export async function createEtage(klinikumId, nummer, bezeichnung) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/etage`, {
    ...opts, method: 'POST',
    body: JSON.stringify({ klinikumId, nummer, bezeichnung }),
  })
  if (!res.ok) throw new Error('Fehler beim Anlegen der Etage')
  return res.json()
}

export async function deleteEtage(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/etage/${id}`, { ...opts, method: 'DELETE' })
  if (!res.ok) throw new Error('Fehler beim Löschen der Etage')
}

export async function createZimmer(etageId, nummer, abteilung, station) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/zimmer`, {
    ...opts, method: 'POST',
    body: JSON.stringify({ etageId, nummer, abteilung, station }),
  })
  if (!res.ok) throw new Error('Fehler beim Anlegen des Zimmers')
  return res.json()
}

export async function deleteZimmer(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/zimmer/${id}`, { ...opts, method: 'DELETE' })
  if (!res.ok) throw new Error('Fehler beim Löschen des Zimmers')
}

export async function createBett(zimmerId, bezeichnung) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/bett`, {
    ...opts, method: 'POST',
    body: JSON.stringify({ zimmerId, bezeichnung }),
  })
  if (!res.ok) throw new Error('Fehler beim Anlegen des Betts')
  return res.json()
}

export async function deleteBett(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/bett/${id}`, { ...opts, method: 'DELETE' })
  if (!res.ok) throw new Error('Fehler beim Löschen des Betts')
}

export async function assignPatientToBett(bettId, patientId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/bett/${bettId}/assign/${patientId}`, { ...opts, method: 'PUT' })
  if (!res.ok) throw new Error('Fehler beim Zuweisen des Patienten')
  return res.json()
}

export async function releaseBett(bettId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/bett/${bettId}/release`, { ...opts, method: 'PUT' })
  if (!res.ok) throw new Error('Fehler beim Freigeben des Betts')
  return res.json()
}

export async function updateBettStatus(bettId, status) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/betten/bett/${bettId}/status`, {
    ...opts, method: 'PUT',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Fehler beim Aktualisieren des Bettstatus')
  return res.json()
}
