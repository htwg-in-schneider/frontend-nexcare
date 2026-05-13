// Iteration 8a: dummy REST source. Replace base URL with our own backend in Iteration 8b.
const BASE_URL = 'https://dummyjson.com';

function mapUserToPatient(user) {
  return {
    id: user.id,
    vorname: user.firstName,
    nachname: user.lastName,
    versicherungsnr: `V-2024-${String(user.id).padStart(3, '0')}`,
    klinikum: 'Klinikum Konstanz',
    status: user.id % 2 === 0 ? 'Ambulant' : 'Stationär',
    geburtsdatum: user.birthDate
      ? new Date(user.birthDate).toLocaleDateString('de-DE')
      : '–',
    telefon: user.phone ?? '–',
    email: user.email ?? '–',
    adresse: user.address
      ? `${user.address.address}, ${user.address.postalCode ?? ''} ${user.address.city ?? ''}`.trim()
      : '–',
    etage: '–',
    abteilung: '–',
    station: '–',
    zimmer: '–',
    bett: '–',
    notfallkontakt: { name: '–', beziehung: '–', telefon: '–' },
  };
}

export async function fetchPatients() {
  const res = await fetch(`${BASE_URL}/users?limit=10`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.users ?? []).map(mapUserToPatient);
}

export async function fetchPatient(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const user = await res.json();
  return mapUserToPatient(user);
}
