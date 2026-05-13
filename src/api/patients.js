// Iteration 8b: real REST backend (nexcare-backend, Spring Boot on :8081)
const BASE_URL = 'http://localhost:8081';

function mapStatus(status) {
  if (status === 'STATIONAER') return 'Stationär';
  if (status === 'AMBULANT') return 'Ambulant';
  return status ?? '';
}

function unmapStatus(status) {
  if (status === 'Stationär') return 'STATIONAER';
  if (status === 'Ambulant') return 'AMBULANT';
  return status;
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
    geburtsdatum: p.geburtsdatum ?? '', // ISO "YYYY-MM-DD"
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
  };
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
  };
}

export async function fetchPatients(params = {}) {
  const qs = new URLSearchParams();
  if (params.name) qs.set('name', params.name);
  if (params.status) qs.set('status', unmapStatus(params.status));
  if (params.klinikum) qs.set('klinikum', params.klinikum);
  const url = `${BASE_URL}/api/patient${qs.toString() ? '?' + qs.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.map(mapPatient);
}

export async function fetchPatient(id) {
  const res = await fetch(`${BASE_URL}/api/patient/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return mapPatient(await res.json());
}

export async function createPatient(patient) {
  const res = await fetch(`${BASE_URL}/api/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(patient)),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return mapPatient(await res.json());
}

export async function updatePatient(id, patient) {
  const res = await fetch(`${BASE_URL}/api/patient/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(patient)),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return mapPatient(await res.json());
}

export async function deletePatient(id) {
  const res = await fetch(`${BASE_URL}/api/patient/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
