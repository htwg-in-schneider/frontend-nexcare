import { authHeaders } from './auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

// --- Medikament-Katalog ---

export async function fetchMedikamente(suche = '') {
  const url = suche ? `${BASE}/api/medikament?suche=${encodeURIComponent(suche)}` : `${BASE}/api/medikament`
  const opts = await authHeaders()
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error('Fehler beim Laden der Medikamente')
  return res.json()
}

export async function createMedikament(data) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/medikament`, {
    method: 'POST', ...opts, body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Erstellen')
  return res.json()
}

export async function updateMedikament(id, data) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/medikament/${id}`, {
    method: 'PUT', ...opts, body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Aktualisieren')
  return res.json()
}

export async function archiviereMedikament(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/medikament/${id}`, { method: 'DELETE', ...opts })
  if (!res.ok) throw new Error('Fehler beim Archivieren')
}

// --- Medikamentenplan pro Patient ---

export async function fetchMedikamentenplan(patientId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/patient/${patientId}/medikamentenplan`, { ...opts })
  if (!res.ok) throw new Error('Fehler beim Laden des Medikamentenplans')
  return res.json()
}

/**
 * @param {number} patientId
 * @param {{ medikament: {id: number}, dosierung: string, wochentage: string, uhrzeiten: string, startDatum: string, endDatum: string }} eintrag
 */
export async function addMedikamentenEintrag(patientId, eintrag) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/patient/${patientId}/medikamentenplan`, {
    method: 'POST', ...opts, body: JSON.stringify(eintrag),
  })
  if (!res.ok) throw new Error('Fehler beim Hinzufügen')
  return res.json()
}

export async function deleteMedikamentenEintrag(patientId, eintragId) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE}/api/patient/${patientId}/medikamentenplan/${eintragId}`, {
    method: 'DELETE', ...opts,
  })
  if (!res.ok) throw new Error('Fehler beim Entfernen')
}
