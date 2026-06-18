import { apiFetch } from './apiClient.js'

function mapStatus(status) {
  if (status === 'STATIONAER') return 'Stationär'
  if (status === 'AMBULANT') return 'Ambulant'
  return status ?? ''
}

function unmapStatus(status) {
  if (status === 'Stationär') return 'STATIONAER'
  if (status === 'Ambulant') return 'AMBULANT'
  return status
}

function mapPatient(p) {
  return {
    id: p.id,
    vorname: p.vorname ?? '',
    nachname: p.nachname ?? '',
    versicherungsnr: p.versicherungsnr ?? '',
    klinikum: p.klinikum?.name ?? '',
    klinikumId: p.klinikum?.id ?? null,
    status: mapStatus(p.status),
    geburtsdatum: p.geburtsdatum ?? '',
    telefon: p.telefon ?? '',
    email: p.email ?? '',
    adresse: p.adresse ?? '',
    etage: p.etage ?? '',
    abteilung: p.abteilung ?? '',
    station: p.station ?? '',
    zimmer: p.zimmer ?? '',
    bett: p.bett ?? '',
    notfallkontakt: p.notfallkontakt
      ? { ...p.notfallkontakt }
      : { name: '', beziehung: '', telefon: '' },
  }
}

function mapToBackend(p) {
  return {
    id: p.id ?? null,
    vorname: p.vorname,
    nachname: p.nachname,
    geburtsdatum: p.geburtsdatum || null,
    versicherungsnr: p.versicherungsnr,
    telefon: p.telefon,
    email: p.email,
    adresse: p.adresse,
    klinikum: p.klinikumId ? { id: Number(p.klinikumId) } : null,
    etage: p.etage,
    abteilung: p.abteilung,
    station: p.station,
    zimmer: p.zimmer,
    bett: p.bett,
    status: unmapStatus(p.status),
    notfallkontakt: p.notfallkontakt,
  }
}

export async function fetchPatients(params = {}) {
  const qs = new URLSearchParams()
  if (params.name) qs.set('name', params.name)
  if (params.status) qs.set('status', unmapStatus(params.status))
  if (params.klinikum) qs.set('klinikum', params.klinikum)
  const query = qs.toString() ? `?${qs}` : ''
  return (await apiFetch(`/api/patient${query}`)).map(mapPatient)
}

export async function fetchPatient(id) {
  return mapPatient(await apiFetch(`/api/patient/${id}`))
}

export async function createPatient(patient) {
  return mapPatient(await apiFetch('/api/patient', {
    method: 'POST',
    body: JSON.stringify(mapToBackend(patient)),
  }))
}

export async function updatePatient(id, patient) {
  return mapPatient(await apiFetch(`/api/patient/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapToBackend(patient)),
  }))
}

export async function deletePatient(id) {
  await apiFetch(`/api/patient/${id}`, { method: 'DELETE' })
}

export async function entlassenPatient(id) {
  return apiFetch(`/api/patient/${id}/entlassen`, { method: 'PATCH' })
}
