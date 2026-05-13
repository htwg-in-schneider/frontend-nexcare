const BASE_URL = 'http://localhost:8081';

export async function fetchKlinika() {
  const res = await fetch(`${BASE_URL}/api/klinikum`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
