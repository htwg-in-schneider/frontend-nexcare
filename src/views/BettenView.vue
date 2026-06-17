<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { fetchKlinika } from '@/api/klinika.js'
import { fetchPatientenByKlinikum } from '@/api/betten.js'
import { updatePatient, fetchPatient } from '@/api/patients.js'

const router = useRouter()
const ui = useUiStore()

const klinika = ref([])
const selectedKlinikumId = ref(null)
const patienten = ref([])
const loading = ref(false)

// Bett-Zuweisung Modal
const assignModal = ref(null) // { patient }
const assignForm = ref({ etage: '', abteilung: '', station: '', zimmer: '', bett: '' })
const saving = ref(false)

onMounted(async () => {
  try {
    klinika.value = await fetchKlinika()
    if (klinika.value.length) selectedKlinikumId.value = klinika.value[0].id
    await loadBetten()
  } catch {
    ui.showToast('Fehler beim Laden der Klinika.', { variant: 'error' })
  }
})

async function loadBetten() {
  if (!selectedKlinikumId.value) return
  loading.value = true
  try {
    patienten.value = await fetchPatientenByKlinikum(selectedKlinikumId.value)
  } catch {
    patienten.value = []
    ui.showToast('Fehler beim Laden der Bettenbelegung.', { variant: 'error' })
  } finally {
    loading.value = false
  }
}

async function onKlinikumChange() {
  await loadBetten()
}

// Gruppierung: { zimmer, etage, abteilung, station, patienten[] }
const zimmerGruppen = computed(() => {
  const map = new Map()
  for (const p of patienten.value) {
    const key = `${p.zimmer || '–'}|${p.station || ''}|${p.abteilung || ''}|${p.etage || ''}`
    if (!map.has(key)) {
      map.set(key, {
        zimmer: p.zimmer || '–',
        etage: p.etage || '–',
        abteilung: p.abteilung || '–',
        station: p.station || '–',
        patienten: [],
      })
    }
    map.get(key).patienten.push(p)
  }
  return Array.from(map.values()).sort((a, b) => a.zimmer.localeCompare(b.zimmer))
})

const selectedKlinikumName = computed(() => {
  return klinika.value.find(k => k.id === selectedKlinikumId.value)?.name ?? ''
})

// Bett-Zuweisung (UC8)
function openAssign(patient) {
  assignForm.value = {
    etage: patient.etage || '',
    abteilung: patient.abteilung || '',
    station: patient.station || '',
    zimmer: patient.zimmer || '',
    bett: patient.bett || '',
  }
  assignModal.value = { patient }
}

async function saveAssign() {
  if (!assignForm.value.zimmer.trim()) {
    ui.showToast('Zimmer ist erforderlich.', { variant: 'error' })
    return
  }
  saving.value = true
  try {
    const p = assignModal.value.patient
    const current = await fetchPatient(p.id)
    await updatePatient(p.id, {
      ...current,
      klinikum: { id: selectedKlinikumId.value },
      etage: assignForm.value.etage,
      abteilung: assignForm.value.abteilung,
      station: assignForm.value.station,
      zimmer: assignForm.value.zimmer,
      bett: assignForm.value.bett,
    })
    ui.showToast('Bett zugewiesen.', { variant: 'success' })
    assignModal.value = null
    await loadBetten()
  } catch {
    ui.showToast('Fehler beim Zuweisen.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}

function goToPatient(id) {
  router.push({ name: 'patient-detail', params: { id } })
}
</script>

<template>
  <AppHeader title="Bettenverwaltung" :show-back="false" />

  <main class="container">
    <!-- Klinikum-Auswahl -->
    <div class="filter-bar">
      <label class="select-label">
        <span>Krankenhaus</span>
        <select v-model="selectedKlinikumId" @change="onKlinikumChange">
          <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
        </select>
      </label>
    </div>

    <p v-if="loading" class="state-msg">Lade Belegung …</p>
    <p v-else-if="!patienten.length" class="state-msg">Keine belegten Zimmer in diesem Krankenhaus.</p>

    <!-- Zimmer-Cards -->
    <div v-else class="zimmer-grid">
      <div v-for="gruppe in zimmerGruppen" :key="gruppe.zimmer" class="zimmer-card">
        <div class="zimmer-head">
          <div>
            <span class="zimmer-nr">Zimmer {{ gruppe.zimmer }}</span>
            <span class="zimmer-info">{{ gruppe.abteilung }} · {{ gruppe.station }} · {{ gruppe.etage }}</span>
          </div>
          <span class="belegt-badge">{{ gruppe.patienten.length }} belegt</span>
        </div>
        <ul class="bett-list">
          <li v-for="p in gruppe.patienten" :key="p.id" class="bett-item">
            <div class="bett-info">
              <span class="bett-label">{{ p.bett || 'Bett' }}</span>
              <span class="patient-name" @click="goToPatient(p.id)">
                {{ p.vorname }} {{ p.nachname }}
              </span>
            </div>
            <button class="assign-btn" @click="openAssign(p)" title="Bett zuweisen / verlegen">
              <i class="bi bi-arrows-move"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <!-- Bett-Zuweisungs-Modal (UC8) -->
  <Teleport to="body">
    <div v-if="assignModal" class="overlay" @click.self="assignModal = null">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>Bett zuweisen – {{ assignModal.patient.vorname }} {{ assignModal.patient.nachname }}</h3>
          <button class="close-btn" @click="assignModal = null" aria-label="Schließen">✕</button>
        </div>
        <div class="modal-body">
          <label><span>Etage</span>
            <input v-model.trim="assignForm.etage" type="text" placeholder="z. B. 3. OG" />
          </label>
          <label><span>Abteilung</span>
            <input v-model.trim="assignForm.abteilung" type="text" placeholder="z. B. Kardiologie" />
          </label>
          <label><span>Station</span>
            <input v-model.trim="assignForm.station" type="text" placeholder="z. B. Station K3" />
          </label>
          <label><span>Zimmer *</span>
            <input v-model.trim="assignForm.zimmer" type="text" placeholder="z. B. 304" required />
          </label>
          <label><span>Bett</span>
            <input v-model.trim="assignForm.bett" type="text" placeholder="z. B. Bett A" />
          </label>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="assignModal = null" :disabled="saving">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="saveAssign" :disabled="saving">
            {{ saving ? 'Speichern …' : 'Bett zuweisen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 56rem; margin: 0 auto; }

.filter-bar { margin-bottom: 1.25rem; }
.select-label { display: flex; flex-direction: column; gap: 0.25rem; }
.select-label > span { font-size: 0.85rem; font-weight: 600; color: var(--color-muted); }
.select-label select {
  padding: 0.625rem 0.75rem; border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem; font-size: 0.95rem; font-family: inherit;
  background: #fff; color: var(--color-text); max-width: 20rem;
}
.select-label select:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }

.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

.zimmer-grid { display: flex; flex-direction: column; gap: 0.875rem; }

.zimmer-card {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
.zimmer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem; background: var(--color-surface);
  border-bottom: 0.0625rem solid var(--color-border);
}
.zimmer-nr { font-weight: 700; font-size: 0.95rem; color: var(--color-text); display: block; }
.zimmer-info { font-size: 0.78rem; color: var(--color-muted); }
.belegt-badge {
  padding: 0.2rem 0.5rem; border-radius: 999px;
  background: #edf4ff; color: #1b4f8a;
  font-size: 0.75rem; font-weight: 600;
}

.bett-list { list-style: none; padding: 0; margin: 0; }
.bett-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-bottom: 0.0625rem solid var(--color-border);
}
.bett-item:last-child { border-bottom: none; }
.bett-info { flex: 1; display: flex; align-items: center; gap: 0.75rem; }
.bett-label {
  background: var(--color-primary); color: #fff;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.15rem 0.5rem; border-radius: 0.375rem;
  white-space: nowrap; flex-shrink: 0;
}
.patient-name {
  font-size: 0.9rem; color: var(--color-text); font-weight: 600;
  cursor: pointer; text-decoration: underline; text-decoration-color: transparent;
}
.patient-name:hover { text-decoration-color: var(--color-primary); color: var(--color-primary); }
.assign-btn {
  background: var(--color-surface); border: 0.0625rem solid var(--color-border);
  border-radius: 0.5rem; padding: 0.375rem 0.625rem;
  color: var(--color-muted); cursor: pointer; font-size: 0.9rem;
}
.assign-btn:hover { background: var(--color-card); color: var(--color-primary); }

/* Modal */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center;
  z-index: 9999;
}
.modal {
  background: #fff; border-radius: 1rem 1rem 0 0;
  width: 100%; max-width: 36rem;
  box-shadow: 0 -8px 40px rgba(0,0,0,.18);
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem; border-bottom: 0.0625rem solid var(--color-border);
}
.modal-head h3 { margin: 0; font-size: 0.95rem; }
.close-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--color-muted); }
.modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.875rem; }
.modal-body label { display: flex; flex-direction: column; gap: 0.25rem; }
.modal-body label > span { font-size: 0.85rem; font-weight: 600; color: var(--color-muted); }
.modal-body input {
  padding: 0.625rem 0.75rem; border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem; font-size: 0.95rem; font-family: inherit;
  background: #fff; color: var(--color-text);
}
.modal-body input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.modal-foot {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem; border-top: 0.0625rem solid var(--color-border);
}
.app-btn { padding: 0.75rem 1.25rem; border: 0; border-radius: 0.625rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.app-btn-secondary { background: var(--color-surface); color: var(--color-text); border: 0.0625rem solid var(--color-border); }
.app-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

@media (min-width: 640px) {
  .overlay { align-items: center; }
  .modal { border-radius: 1rem; }
  .zimmer-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
}
</style>
