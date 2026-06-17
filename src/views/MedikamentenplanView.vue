<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import {
  fetchMedikamentenplan,
  addMedikamentenEintrag,
  deleteMedikamentenEintrag,
  fetchMedikamente,
} from '@/api/medikamente.js'
import { fetchPatient } from '@/api/patients.js'

const props = defineProps({ patientId: { type: Number, required: true } })
const router = useRouter()
const ui = useUiStore()

const patient = ref(null)
const eintraege = ref([])
const loading = ref(false)

// Hinzufügen-Modal
const addOpen = ref(false)
const suche = ref('')
const sucheResults = ref([])
const sucheLoading = ref(false)
const form = ref({ medikamentId: null, medikamentName: '', dosierung: '', einnahme: '', verschreibungsDatum: today() })
const saving = ref(false)

function today() {
  return new Date().toISOString().split('T')[0]
}

async function load() {
  loading.value = true
  try {
    [patient.value, eintraege.value] = await Promise.all([
      fetchPatient(props.patientId),
      fetchMedikamentenplan(props.patientId),
    ])
  } catch {
    ui.showToast('Fehler beim Laden.', { variant: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Suche im Katalog
let searchTimer = null
async function onSuche() {
  clearTimeout(searchTimer)
  if (!suche.value.trim()) { sucheResults.value = []; return }
  searchTimer = setTimeout(async () => {
    sucheLoading.value = true
    try { sucheResults.value = await fetchMedikamente(suche.value) } catch { sucheResults.value = [] } finally { sucheLoading.value = false }
  }, 250)
}

function waehlemedikament(m) {
  form.value.medikamentId = m.id
  form.value.medikamentName = m.name
  suche.value = m.name
  sucheResults.value = []
}

function openAdd() {
  form.value = { medikamentId: null, medikamentName: '', dosierung: '', einnahme: '', verschreibungsDatum: today() }
  suche.value = ''
  sucheResults.value = []
  addOpen.value = true
}

async function saveAdd() {
  if (!form.value.medikamentId) { ui.showToast('Bitte ein Medikament auswählen.', { variant: 'error' }); return }
  if (!form.value.dosierung.trim()) { ui.showToast('Dosierung ist erforderlich.', { variant: 'error' }); return }
  if (!form.value.einnahme.trim()) { ui.showToast('Einnahme ist erforderlich.', { variant: 'error' }); return }
  saving.value = true
  try {
    await addMedikamentenEintrag(props.patientId, {
      medikament: { id: form.value.medikamentId },
      dosierung: form.value.dosierung.trim(),
      einnahme: form.value.einnahme.trim(),
      verschreibungsDatum: form.value.verschreibungsDatum,
    })
    ui.showToast('Medikament hinzugefügt.', { variant: 'success' })
    addOpen.value = false
    await load()
  } catch {
    ui.showToast('Fehler beim Hinzufügen.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}

async function removeEintrag(eintrag) {
  const ok = await ui.confirm({
    title: 'Medikament entfernen',
    message: `${eintrag.medikament.name} aus dem Plan entfernen?`,
    confirmLabel: 'Entfernen',
    cancelLabel: 'Abbrechen',
  })
  if (!ok) return
  try {
    await deleteMedikamentenEintrag(props.patientId, eintrag.id)
    ui.showToast('Medikament entfernt.')
    await load()
  } catch {
    ui.showToast('Fehler beim Entfernen.', { variant: 'error' })
  }
}

const datumDe = (iso) => {
  if (!iso) return '–'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

const patientName = computed(() => patient.value ? `${patient.value.vorname} ${patient.value.nachname}` : '')
</script>

<template>
  <AppHeader
    :title="patientName ? `Medikamentenplan – ${patientName}` : 'Medikamentenplan'"
    :show-back="true"
    :back-route="`/patient/view/${patientId}`"
  />

  <main class="container">
    <p v-if="loading" class="state-msg">Lade …</p>

    <template v-else>
      <!-- Leerer Zustand -->
      <div v-if="!eintraege.length" class="empty">
        <i class="bi bi-clipboard2-x empty-icon"></i>
        <p>Kein Medikamentenplan vorhanden.</p>
      </div>

      <!-- Einträge -->
      <ul v-else class="plan-list">
        <li v-for="e in eintraege" :key="e.id" class="plan-item">
          <div class="plan-main">
            <span class="med-name">{{ e.medikament.name }}</span>
            <span class="med-wirkstoff">{{ e.medikament.wirkstoff }}</span>
          </div>
          <div class="plan-meta">
            <span><i class="bi bi-capsule"></i> {{ e.dosierung }}</span>
            <span><i class="bi bi-clock"></i> {{ e.einnahme }}</span>
            <span><i class="bi bi-calendar3"></i> {{ datumDe(e.verschreibungsDatum) }}</span>
          </div>
          <button class="remove-btn" aria-label="Entfernen" @click="removeEintrag(e)">
            <i class="bi bi-trash"></i>
          </button>
        </li>
      </ul>

      <!-- FAB Hinzufügen -->
      <button class="fab" aria-label="Medikament hinzufügen" @click="openAdd">
        <i class="bi bi-plus-lg"></i>
      </button>
    </template>
  </main>

  <!-- Hinzufügen-Modal -->
  <Teleport to="body">
    <div v-if="addOpen" class="overlay" @click.self="addOpen = false">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>Medikament hinzufügen</h3>
          <button class="close-btn" @click="addOpen = false" aria-label="Schließen">✕</button>
        </div>
        <div class="modal-body">
          <!-- Medikament-Suche -->
          <label>
            <span>Medikament suchen *</span>
            <div class="search-wrap">
              <input
                v-model="suche"
                type="search"
                placeholder="Name oder Wirkstoff eingeben …"
                @input="onSuche"
                autocomplete="off"
              />
              <ul v-if="sucheResults.length" class="suggest">
                <li v-for="m in sucheResults" :key="m.id" @click="waehlemedikament(m)">
                  <strong>{{ m.name }}</strong>
                  <span>{{ m.wirkstoff }}</span>
                </li>
              </ul>
              <p v-if="sucheLoading" class="hint">Suche …</p>
            </div>
            <p v-if="form.medikamentId" class="selected-hint">
              <i class="bi bi-check-circle-fill"></i> {{ form.medikamentName }}
            </p>
          </label>

          <label>
            <span>Dosierung * <small>(z. B. 500 mg)</small></span>
            <input v-model.trim="form.dosierung" type="text" placeholder="500 mg" />
          </label>
          <label>
            <span>Einnahme * <small>(z. B. 2× täglich)</small></span>
            <input v-model.trim="form.einnahme" type="text" placeholder="2× täglich nach dem Essen" />
          </label>
          <label>
            <span>Verschreibungsdatum *</span>
            <input v-model="form.verschreibungsDatum" type="date" />
          </label>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="addOpen = false" :disabled="saving">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="saveAdd" :disabled="saving">
            {{ saving ? 'Speichern …' : 'Hinzufügen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 48rem; margin: 0 auto; }

.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

.empty { text-align: center; margin-top: 3rem; color: var(--color-muted); }
.empty-icon { font-size: 3rem; display: block; margin-bottom: 0.5rem; }

.plan-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.plan-item {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 0.875rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.plan-main { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.med-name { font-weight: 700; font-size: 0.95rem; color: var(--color-text); }
.med-wirkstoff { font-size: 0.8rem; color: var(--color-muted); }
.plan-meta { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.82rem; color: var(--color-muted); }
.plan-meta i { margin-right: 0.25rem; }
.remove-btn {
  background: none; border: none; color: var(--color-muted);
  font-size: 1rem; cursor: pointer; padding: 0.25rem; border-radius: 0.375rem; flex-shrink: 0;
}
.remove-btn:hover { color: #b3372e; background: #fdf0ef; }

.fab {
  position: fixed; bottom: 5rem; right: 1.25rem;
  width: 3.25rem; height: 3.25rem; border-radius: 50%;
  background: var(--color-primary); color: #fff; border: none;
  font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.2);
  display: flex; align-items: center; justify-content: center;
}
.fab:hover { filter: brightness(1.08); }

.search-wrap { position: relative; }
.suggest {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 10;
  background: #fff; border: 0.0625rem solid var(--color-border);
  border-top: none; border-radius: 0 0 0.625rem 0.625rem;
  list-style: none; padding: 0; margin: 0; max-height: 12rem; overflow-y: auto;
}
.suggest li {
  padding: 0.625rem 0.75rem; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;
  font-size: 0.9rem;
}
.suggest li:hover { background: var(--color-surface); }
.suggest li span { font-size: 0.78rem; color: var(--color-muted); }
.hint { font-size: 0.8rem; color: var(--color-muted); margin: 0.25rem 0 0; }
.selected-hint { font-size: 0.82rem; color: var(--color-primary); margin: 0.25rem 0 0; }
.selected-hint i { margin-right: 0.25rem; }
</style>

<style>
/* Modal – unscoped weil via Teleport in body gerendert */
.modal {
  background: #fff; border-radius: 1rem 1rem 0 0;
  width: 100%; max-width: 40rem;
  box-shadow: 0 -8px 40px rgba(0,0,0,.18);
  max-height: 92vh; overflow-y: auto;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.125rem 1.5rem; border-bottom: 0.0625rem solid var(--color-border);
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.modal-head h3 { margin: 0; font-size: 1rem; }
@media (min-width: 640px) {
  .overlay { align-items: center; padding: 1rem; }
  .modal { border-radius: 1rem; max-height: 88vh; }
}
</style>
