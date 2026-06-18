import { authHeaders } from './auth.js'
import { throwApiError } from './apiError.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

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
  const url = `${BASE_URL}/api/patient${qs.toString() ? '?' + qs.toString() : ''}`
  const opts = await authHeaders()
  const res = await fetch(url, opts)
  if (!res.ok) await throwApiError(res)
  return (await res.json()).map(mapPatient)
}

export async function fetchPatient(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/patient/${id}`, opts)
  if (!res.ok) await throwApiError(res)
  return mapPatient(await res.json())
}

export async function createPatient(patient) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/patient`, {
    method: 'POST',
    ...opts,
    body: JSON.stringify(mapToBackend(patient)),
  })
  if (!res.ok) await throwApiError(res)
  return mapPatient(await res.json())
}

export async function updatePatient(id, patient) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/patient/${id}`, {
    method: 'PUT',
    ...opts,
    body: JSON.stringify(mapToBackend(patient)),
  })
  if (!res.ok) await throwApiError(res)
  return mapPatient(await res.json())
}

export async function deletePatient(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/patient/${id}`, { method: 'DELETE', ...opts })
  if (!res.ok) await throwApiError(res)
}

export async function entlassenPatient(id) {
  const opts = await authHeaders()
  const res = await fetch(`${BASE_URL}/api/patient/${id}/entlassen`, { method: 'PATCH', ...opts })
  if (!res.ok) await throwApiError(res)
  return res.json()
}
