// Iteration 8b: real REST backend (nexcare-backend, Spring Boot on :8081)
const BASE_URL = 'http://localhost:8081';

function mapStatus(status) {
  if (status === 'STATIONAER') return 'Stationär';
  if (status === 'AMBULANT') return 'Ambulant';
  return status ?? '';
}

function formatGeburtsdatum(iso) {
  if (!iso) return '–';
  // backend liefert "1985-03-15"
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function mapPatient(p) {
  return {
    id: p.id,
    vorname: p.vorname,
    nachname: p.nachname,
    versicherungsnr: p.versicherungsnr,
    klinikum: p.klinikum?.name ?? '–',
    klinikumId: p.klinikum?.id ?? null,
    status: mapStatus(p.status),
    geburtsdatum: formatGeburtsdatum(p.geburtsdatum),
    telefon: p.telefon ?? '–',
    email: p.email ?? '–',
    adresse: p.adresse ?? '–',
    etage: p.etage ?? '–',
    abteilung: p.abteilung ?? '–',
    station: p.station ?? '–',
    zimmer: p.zimmer ?? '–',
    bett: p.bett ?? '–',
    notfallkontakt: p.notfallkontakt ?? { name: '–', beziehung: '–', telefon: '–' },
  };
}

export async function fetchPatients() {
  const res = await fetch(`${BASE_URL}/api/patient`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.map(mapPatient);
}

export async function fetchPatient(id) {
  const res = await fetch(`${BASE_URL}/api/patient/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return mapPatient(data);
}
