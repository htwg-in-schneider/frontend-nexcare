import { apiFetch } from './apiClient.js'

export async function fetchMeinAntrag() {
  return apiFetch('/api/portal/aufnahme-antrag') ?? null
}

export async function submitAntrag(data) {
  return apiFetch('/api/portal/aufnahme-antrag', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchOffeneAntraege() {
  return apiFetch('/api/aufnahme-antraege')
}

export async function bestaetigen(id) {
  return apiFetch(`/api/aufnahme-antraege/${id}/bestaetigen`, { method: 'POST' })
}

export async function ablehnen(id) {
  await apiFetch(`/api/aufnahme-antraege/${id}/ablehnen`, { method: 'POST' })
}
