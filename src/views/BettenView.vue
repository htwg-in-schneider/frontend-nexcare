<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { useUserStore } from '@/stores/user.js'
import { fetchKlinika } from '@/api/klinika.js'
import { fetchPatientenByKlinikum } from '@/api/betten.js'
import {
  fetchBettStruktur,
  createEtage, deleteEtage,
  createZimmer, deleteZimmer,
  createBett, deleteBett,
  assignPatientToBett, releaseBett, updateBettStatus,
} from '@/api/betten.js'

const router = useRouter()
const ui = useUiStore()
const userStore = useUserStore()

const klinika = ref([])
const selectedKlinikumId = ref(null)
const struktur = ref(null)
const loading = ref(false)

// Für Zuweisung: Patienten ohne Bett
const allePatienten = ref([])

// Expand-State
const expandedZimmer = ref(new Set())

// Admin-Modals
const newEtageModal = ref(false)
const newEtageForm = ref({ nummer: '', bezeichnung: '' })

const newZimmerModal = ref(null) // { etageId }
const newZimmerForm = ref({ nummer: '', abteilung: '', station: '' })

const newBettModal = ref(null) // { zimmerId }
const newBettForm = ref({ bezeichnung: '' })

// Zuweisung-Modal
const assignModal = ref(null) // { bett }
const assignPatientId = ref('')

const saving = ref(false)

let pollTimer = null

onMounted(async () => {
  try {
    klinika.value = await fetchKlinika()
    if (klinika.value.length) selectedKlinikumId.value = klinika.value[0].id
    await reload()
  } catch {
    ui.showToast('Fehler beim Laden.', { variant: 'error' })
  }
  pollTimer = setInterval(reload, 30000)
})

onUnmounted(() => clearInterval(pollTimer))

async function reload() {
  if (!selectedKlinikumId.value) return
  loading.value = true
  try {
    const [str, pats] = await Promise.all([
      fetchBettStruktur(selectedKlinikumId.value),
      fetchPatientenByKlinikum(selectedKlinikumId.value),
    ])
    struktur.value = str
    allePatienten.value = pats
  } catch {
    ui.showToast('Fehler beim Laden der Bettstruktur.', { variant: 'error' })
  } finally {
    loading.value = false
  }
}

const isAdmin = computed(() => userStore.isAdmin)

const belegtCount = computed(() => {
  if (!struktur.value) return 0
  return struktur.value.etagen.flatMap(e => e.zimmer).flatMap(z => z.betten)
    .filter(b => b.status === 'BELEGT').length
})
const freieCount = computed(() => {
  if (!struktur.value) return 0
  return struktur.value.etagen.flatMap(e => e.zimmer).flatMap(z => z.betten)
    .filter(b => b.status === 'FREI').length
})
const gesamtCount = computed(() => {
  if (!struktur.value) return 0
  return struktur.value.etagen.flatMap(e => e.zimmer).flatMap(z => z.betten).length
})

function toggleZimmer(zimmerId) {
  if (expandedZimmer.value.has(zimmerId)) {
    expandedZimmer.value.delete(zimmerId)
  } else {
    expandedZimmer.value.add(zimmerId)
  }
  expandedZimmer.value = new Set(expandedZimmer.value)
}

// ── Admin: Etage anlegen ────────────────────────────────────────────────────
async function submitNewEtage() {
  if (!newEtageForm.value.bezeichnung.trim()) return
  saving.value = true
  try {
    const nummer = parseInt(newEtageForm.value.nummer) || 0
    const etage = await createEtage(selectedKlinikumId.value, nummer, newEtageForm.value.bezeichnung.trim())
    struktur.value.etagen.push({ ...etage, zimmer: [] })
    struktur.value.etagen.sort((a, b) => a.nummer - b.nummer)
    newEtageModal.value = false
    newEtageForm.value = { nummer: '', bezeichnung: '' }
    ui.showToast('Etage angelegt.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Anlegen der Etage.', { variant: 'error' }) }
  finally { saving.value = false }
}

async function onDeleteEtage(etage) {
  const ok = await ui.confirm({ title: 'Etage löschen', message: `"${etage.bezeichnung}" und alle Zimmer / Betten darin löschen?`, confirmLabel: 'Löschen', cancelLabel: 'Abbrechen' })
  if (!ok) return
  try {
    await deleteEtage(etage.id)
    struktur.value.etagen = struktur.value.etagen.filter(e => e.id !== etage.id)
    ui.showToast('Etage gelöscht.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Löschen.', { variant: 'error' }) }
}

// ── Admin: Zimmer anlegen ───────────────────────────────────────────────────
async function submitNewZimmer() {
  if (!newZimmerForm.value.nummer.trim()) return
  saving.value = true
  try {
    const zimmer = await createZimmer(newZimmerModal.value.etageId, newZimmerForm.value.nummer.trim(), newZimmerForm.value.abteilung.trim(), newZimmerForm.value.station.trim())
    const etage = struktur.value.etagen.find(e => e.id === newZimmerModal.value.etageId)
    if (etage) etage.zimmer.push({ ...zimmer, betten: [] })
    newZimmerModal.value = null
    newZimmerForm.value = { nummer: '', abteilung: '', station: '' }
    ui.showToast('Zimmer angelegt.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Anlegen.', { variant: 'error' }) }
  finally { saving.value = false }
}

async function onDeleteZimmer(etage, zimmer) {
  const ok = await ui.confirm({ title: 'Zimmer löschen', message: `Zimmer ${zimmer.nummer} und alle Betten darin löschen?`, confirmLabel: 'Löschen', cancelLabel: 'Abbrechen' })
  if (!ok) return
  try {
    await deleteZimmer(zimmer.id)
    etage.zimmer = etage.zimmer.filter(z => z.id !== zimmer.id)
    ui.showToast('Zimmer gelöscht.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Löschen.', { variant: 'error' }) }
}

// ── Admin: Bett anlegen ─────────────────────────────────────────────────────
async function submitNewBett() {
  if (!newBettForm.value.bezeichnung.trim()) return
  saving.value = true
  try {
    const bett = await createBett(newBettModal.value.zimmerId, newBettForm.value.bezeichnung.trim())
    for (const etage of struktur.value.etagen) {
      const zimmer = etage.zimmer.find(z => z.id === newBettModal.value.zimmerId)
      if (zimmer) { zimmer.betten.push(bett); break }
    }
    newBettModal.value = null
    newBettForm.value = { bezeichnung: '' }
    ui.showToast('Bett angelegt.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Anlegen.', { variant: 'error' }) }
  finally { saving.value = false }
}

async function onDeleteBett(zimmer, bett) {
  const ok = await ui.confirm({ title: 'Bett löschen', message: `${bett.bezeichnung} löschen?`, confirmLabel: 'Löschen', cancelLabel: 'Abbrechen' })
  if (!ok) return
  try {
    await deleteBett(bett.id)
    zimmer.betten = zimmer.betten.filter(b => b.id !== bett.id)
    ui.showToast('Bett gelöscht.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Löschen.', { variant: 'error' }) }
}

async function onToggleGesperrt(bett) {
  const newStatus = bett.status === 'GESPERRT' ? 'FREI' : 'GESPERRT'
  try {
    await updateBettStatus(bett.id, newStatus)
    bett.status = newStatus
  } catch { ui.showToast('Fehler beim Aktualisieren.', { variant: 'error' }) }
}

// ── Zuweisung (Arzt / Pfleger) ──────────────────────────────────────────────
function openAssign(bett) {
  assignModal.value = { bett }
  assignPatientId.value = ''
}

async function submitAssign() {
  if (!assignPatientId.value) return
  saving.value = true
  try {
    const result = await assignPatientToBett(assignModal.value.bett.id, Number(assignPatientId.value))
    assignModal.value.bett.status = 'BELEGT'
    assignModal.value.bett.patientId = result.patientId
    assignModal.value.bett.patientName = result.patientName
    assignModal.value = null
    ui.showToast('Patient zugewiesen.', { variant: 'success' })
    await reload()
  } catch { ui.showToast('Fehler beim Zuweisen.', { variant: 'error' }) }
  finally { saving.value = false }
}

async function onRelease(bett) {
  const ok = await ui.confirm({ title: 'Bett freigeben', message: `${bett.bezeichnung} freigeben?`, confirmLabel: 'Freigeben', cancelLabel: 'Abbrechen' })
  if (!ok) return
  try {
    await releaseBett(bett.id)
    bett.status = 'FREI'
    bett.patientId = null
    bett.patientName = null
    ui.showToast('Bett freigegeben.', { variant: 'success' })
  } catch { ui.showToast('Fehler beim Freigeben.', { variant: 'error' }) }
}

// Patienten ohne Bett für Dropdown
const freiePatienten = computed(() => {
  if (!struktur.value) return allePatienten.value
  const belegtIds = new Set(
    struktur.value.etagen.flatMap(e => e.zimmer).flatMap(z => z.betten)
      .filter(b => b.patientId).map(b => b.patientId)
  )
  return allePatienten.value.filter(p => !belegtIds.has(p.id))
})

function goToPatient(id) {
  router.push({ name: 'patient-detail', params: { id } })
}

// Sorted floors: highest floor on top
const etagenDesc = computed(() => {
  if (!struktur.value) return []
  return [...struktur.value.etagen].sort((a, b) => b.nummer - a.nummer)
})
</script>

<template>
  <AppHeader title="Bettenverwaltung" :show-back="false" />

  <main class="container">
    <!-- Klinikum-Auswahl -->
    <div class="filter-bar">
      <label class="select-label">
        <span>Krankenhaus</span>
        <select v-model="selectedKlinikumId" @change="reload">
          <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
        </select>
      </label>
    </div>

    <!-- Übersicht-Stats -->
    <div v-if="struktur" class="stats-row">
      <div class="stat-chip frei">{{ freieCount }} frei</div>
      <div class="stat-chip belegt">{{ belegtCount }} belegt</div>
      <div class="stat-chip gesamt">{{ gesamtCount }} gesamt</div>
    </div>

    <p v-if="loading && !struktur" class="state-msg">Lade Bettstruktur …</p>
    <p v-else-if="struktur && !struktur.etagen.length" class="state-msg">
      Keine Etagen angelegt.
      <span v-if="isAdmin">Füge unten eine Etage hinzu.</span>
    </p>

    <!-- Gebäude-Modell -->
    <div v-if="struktur" class="building-model">

      <!-- Etagen (von oben nach unten) -->
      <div
        v-for="etage in etagenDesc"
        :key="etage.id"
        class="floor-block"
      >
        <div class="floor-header">
          <div class="floor-label">
            <i class="bi bi-layers-half"></i>
            <span class="floor-name">{{ etage.bezeichnung }}</span>
            <span class="floor-stats">
              {{ etage.zimmer.flatMap(z => z.betten).filter(b => b.status === 'BELEGT').length }} / {{ etage.zimmer.flatMap(z => z.betten).length }} belegt
            </span>
          </div>
          <div class="floor-actions" v-if="isAdmin">
            <button class="icon-btn green" @click="newZimmerModal = { etageId: etage.id }" title="Zimmer hinzufügen">
              <i class="bi bi-door-open"></i> +
            </button>
            <button class="icon-btn red" @click="onDeleteEtage(etage)" title="Etage löschen">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Zimmer-Raster -->
        <div class="rooms-grid" v-if="etage.zimmer.length">
          <div
            v-for="zimmer in etage.zimmer"
            :key="zimmer.id"
            class="room-card"
            :class="{ expanded: expandedZimmer.has(zimmer.id) }"
          >
            <div class="room-header" @click="toggleZimmer(zimmer.id)">
              <div>
                <span class="room-nr">{{ zimmer.nummer }}</span>
                <span class="room-dept">{{ zimmer.abteilung }}</span>
              </div>
              <div class="room-bed-dots">
                <span
                  v-for="bett in zimmer.betten"
                  :key="bett.id"
                  class="bed-dot"
                  :class="bett.status.toLowerCase()"
                  :title="bett.bezeichnung + (bett.patientName ? ': ' + bett.patientName : '') + ' (' + bett.status + ')'"
                ></span>
              </div>
              <i :class="['bi', expandedZimmer.has(zimmer.id) ? 'bi-chevron-up' : 'bi-chevron-down', 'expand-icon']"></i>
            </div>

            <!-- Betten-Detail (aufgeklappt) -->
            <div v-if="expandedZimmer.has(zimmer.id)" class="bett-list">
              <div class="zimmer-meta">{{ zimmer.station }}</div>

              <div v-for="bett in zimmer.betten" :key="bett.id" class="bett-row" :class="bett.status.toLowerCase()">
                <div class="bett-info">
                  <span class="bett-status-dot" :class="bett.status.toLowerCase()"></span>
                  <span class="bett-name">{{ bett.bezeichnung }}</span>
                  <span v-if="bett.patientName" class="bett-patient" @click="goToPatient(bett.patientId)">
                    {{ bett.patientName }}
                  </span>
                  <span v-else-if="bett.status === 'FREI'" class="bett-frei-label">frei</span>
                  <span v-else-if="bett.status === 'GESPERRT'" class="bett-sperr-label">gesperrt</span>
                </div>
                <div class="bett-actions">
                  <!-- Zuweisung für Arzt/Pfleger und Admin -->
                  <button v-if="bett.status === 'FREI'" class="bett-btn assign" @click="openAssign(bett)" title="Patient zuweisen">
                    <i class="bi bi-person-plus"></i>
                  </button>
                  <button v-if="bett.status === 'BELEGT'" class="bett-btn release" @click="onRelease(bett)" title="Bett freigeben">
                    <i class="bi bi-person-dash"></i>
                  </button>
                  <!-- Admin: Sperren/Entsperren -->
                  <button v-if="isAdmin" class="bett-btn lock" :class="{ active: bett.status === 'GESPERRT' }" @click="onToggleGesperrt(bett)" :title="bett.status === 'GESPERRT' ? 'Entsperren' : 'Sperren'">
                    <i :class="['bi', bett.status === 'GESPERRT' ? 'bi-lock-fill' : 'bi-lock']"></i>
                  </button>
                  <!-- Admin: Bett löschen -->
                  <button v-if="isAdmin" class="bett-btn delete" @click="onDeleteBett(zimmer, bett)" title="Bett löschen">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Admin: Bett hinzufügen -->
              <button v-if="isAdmin" class="add-bett-btn" @click="newBettModal = { zimmerId: zimmer.id }">
                <i class="bi bi-plus"></i> Bett hinzufügen
              </button>

              <!-- Admin: Zimmer löschen -->
              <button v-if="isAdmin" class="delete-zimmer-btn" @click="onDeleteZimmer(etage, zimmer)">
                <i class="bi bi-trash"></i> Zimmer löschen
              </button>
            </div>
          </div>
        </div>

        <p v-else class="no-rooms">Keine Zimmer.</p>
      </div>

      <!-- Admin: Etage hinzufügen -->
      <button v-if="isAdmin" class="add-floor-btn" @click="newEtageModal = true">
        <i class="bi bi-plus-lg"></i> Etage hinzufügen
      </button>
    </div>
  </main>

  <!-- Modal: Neue Etage -->
  <Teleport to="body">
    <div v-if="newEtageModal" class="overlay" @click.self="newEtageModal = false">
      <div class="modal" role="dialog">
        <div class="modal-head">
          <h3>Etage hinzufügen</h3>
          <button class="close-btn" @click="newEtageModal = false">✕</button>
        </div>
        <div class="modal-body">
          <label><span>Nummer (0 = EG, 1 = 1.OG, …)</span>
            <input v-model.number="newEtageForm.nummer" type="number" min="0" placeholder="0" />
          </label>
          <label><span>Bezeichnung *</span>
            <input v-model.trim="newEtageForm.bezeichnung" type="text" placeholder="z. B. EG, 1. OG" required />
          </label>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="newEtageModal = false">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="submitNewEtage" :disabled="saving">Anlegen</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal: Neues Zimmer -->
  <Teleport to="body">
    <div v-if="newZimmerModal" class="overlay" @click.self="newZimmerModal = null">
      <div class="modal" role="dialog">
        <div class="modal-head">
          <h3>Zimmer hinzufügen</h3>
          <button class="close-btn" @click="newZimmerModal = null">✕</button>
        </div>
        <div class="modal-body">
          <label><span>Zimmernummer *</span>
            <input v-model.trim="newZimmerForm.nummer" type="text" placeholder="z. B. 301" required />
          </label>
          <label><span>Abteilung</span>
            <input v-model.trim="newZimmerForm.abteilung" type="text" placeholder="z. B. Kardiologie" />
          </label>
          <label><span>Station</span>
            <input v-model.trim="newZimmerForm.station" type="text" placeholder="z. B. Station K3" />
          </label>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="newZimmerModal = null">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="submitNewZimmer" :disabled="saving">Anlegen</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal: Neues Bett -->
  <Teleport to="body">
    <div v-if="newBettModal" class="overlay" @click.self="newBettModal = null">
      <div class="modal" role="dialog">
        <div class="modal-head">
          <h3>Bett hinzufügen</h3>
          <button class="close-btn" @click="newBettModal = null">✕</button>
        </div>
        <div class="modal-body">
          <label><span>Bezeichnung *</span>
            <input v-model.trim="newBettForm.bezeichnung" type="text" placeholder="z. B. Bett A" required />
          </label>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="newBettModal = null">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="submitNewBett" :disabled="saving">Anlegen</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal: Patient zuweisen -->
  <Teleport to="body">
    <div v-if="assignModal" class="overlay" @click.self="assignModal = null">
      <div class="modal" role="dialog">
        <div class="modal-head">
          <h3>Patient zuweisen – {{ assignModal.bett.bezeichnung }}</h3>
          <button class="close-btn" @click="assignModal = null">✕</button>
        </div>
        <div class="modal-body">
          <label><span>Patient *</span>
            <select v-model="assignPatientId" required>
              <option value="">– Patient wählen –</option>
              <option v-for="p in freiePatienten" :key="p.id" :value="p.id">
                {{ p.vorname }} {{ p.nachname }}
              </option>
            </select>
          </label>
          <p v-if="!freiePatienten.length" class="hint-msg">Keine Patienten ohne Bett verfügbar.</p>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="assignModal = null" :disabled="saving">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="submitAssign" :disabled="saving || !assignPatientId">
            {{ saving ? 'Speichern …' : 'Zuweisen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 56rem; margin: 0 auto; }

.filter-bar { margin-bottom: 1rem; }
.select-label { display: flex; flex-direction: column; gap: 0.25rem; }
.select-label > span { font-size: 0.85rem; font-weight: 600; color: var(--color-muted); }
.select-label select {
  padding: 0.625rem 0.75rem; border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem; font-size: 0.95rem; font-family: inherit;
  background: #fff; color: var(--color-text); max-width: 20rem;
}

.stats-row {
  display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;
}
.stat-chip {
  padding: 0.25rem 0.75rem; border-radius: 999px;
  font-size: 0.8rem; font-weight: 700;
}
.stat-chip.frei { background: #dcfce7; color: #166534; }
.stat-chip.belegt { background: #fee2e2; color: #991b1b; }
.stat-chip.gesamt { background: #f1f5f9; color: #475569; }

.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

/* ── Gebäude-Modell ─────────────────────────────────────────────────────────── */
.building-model {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.floor-block {
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 3px 0 rgba(0,0,0,.07), var(--shadow-card);
  transition: box-shadow 0.15s;
}
.floor-block:hover { box-shadow: 0 4px 0 rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.08); }

.floor-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f8ff 100%);
  border-bottom: 1px solid var(--color-border);
}
.floor-label { display: flex; align-items: center; gap: 0.5rem; }
.floor-label .bi { color: var(--color-primary); font-size: 1rem; }
.floor-name { font-weight: 700; font-size: 0.95rem; color: var(--color-text); }
.floor-stats { font-size: 0.75rem; color: var(--color-muted); margin-left: 0.25rem; }

.floor-actions { display: flex; gap: 0.375rem; }
.icon-btn {
  border: none; border-radius: 0.5rem; padding: 0.3rem 0.6rem;
  font-size: 0.8rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 0.2rem;
}
.icon-btn.green { background: #dcfce7; color: #166534; }
.icon-btn.green:hover { background: #bbf7d0; }
.icon-btn.red { background: #fee2e2; color: #991b1b; }
.icon-btn.red:hover { background: #fecaca; }

/* ── Zimmer-Raster ──────────────────────────────────────────────────────────── */
.rooms-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
}

.room-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  min-width: 8rem;
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}
.room-card.expanded { flex-basis: 100%; }

.room-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem;
}
.room-nr { font-weight: 700; font-size: 0.9rem; color: var(--color-text); }
.room-dept { font-size: 0.72rem; color: var(--color-muted); display: block; }
.room-bed-dots { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; justify-content: flex-end; }
.bed-dot {
  width: 10px; height: 10px; border-radius: 50%;
  flex-shrink: 0;
}
.bed-dot.frei { background: #22c55e; }
.bed-dot.belegt { background: #ef4444; }
.bed-dot.gesperrt { background: #94a3b8; }

.expand-icon { font-size: 0.75rem; color: var(--color-muted); margin-left: 0.25rem; }

/* ── Bett-Liste ─────────────────────────────────────────────────────────────── */
.bett-list {
  border-top: 1px solid var(--color-border);
  padding: 0.5rem 0;
}
.zimmer-meta {
  font-size: 0.75rem; color: var(--color-muted);
  padding: 0 0.75rem 0.375rem;
}

.bett-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}
.bett-row:last-of-type { border-bottom: none; }
.bett-row.belegt { background: rgba(239,68,68,.04); }
.bett-row.gesperrt { background: rgba(148,163,184,.07); }

.bett-info { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; }
.bett-status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.bett-status-dot.frei { background: #22c55e; }
.bett-status-dot.belegt { background: #ef4444; }
.bett-status-dot.gesperrt { background: #94a3b8; }

.bett-name { font-size: 0.85rem; font-weight: 600; color: var(--color-text); white-space: nowrap; }
.bett-patient {
  font-size: 0.82rem; color: var(--color-primary); font-weight: 500;
  cursor: pointer; text-decoration: underline; text-decoration-color: transparent;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bett-patient:hover { text-decoration-color: var(--color-primary); }
.bett-frei-label { font-size: 0.75rem; color: #16a34a; }
.bett-sperr-label { font-size: 0.75rem; color: #94a3b8; }

.bett-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
.bett-btn {
  border: none; border-radius: 0.4rem; padding: 0.3rem 0.5rem;
  font-size: 0.8rem; cursor: pointer;
}
.bett-btn.assign { background: #dcfce7; color: #166534; }
.bett-btn.assign:hover { background: #bbf7d0; }
.bett-btn.release { background: #fee2e2; color: #991b1b; }
.bett-btn.release:hover { background: #fecaca; }
.bett-btn.lock { background: #f1f5f9; color: #64748b; }
.bett-btn.lock.active { background: #fef3c7; color: #92400e; }
.bett-btn.lock:hover { background: #e2e8f0; }
.bett-btn.delete { background: #fff1f2; color: #9f1239; }
.bett-btn.delete:hover { background: #ffe4e6; }

.add-bett-btn, .delete-zimmer-btn {
  width: 100%; border: none; background: none; padding: 0.375rem 0.75rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; text-align: left;
  display: flex; align-items: center; gap: 0.25rem;
}
.add-bett-btn { color: var(--color-primary); }
.add-bett-btn:hover { background: rgba(59,130,246,.06); }
.delete-zimmer-btn { color: #991b1b; border-top: 1px solid var(--color-border); }
.delete-zimmer-btn:hover { background: #fff1f2; }

.no-rooms {
  font-size: 0.85rem; color: var(--color-muted);
  padding: 0.75rem 1rem; margin: 0;
}

.add-floor-btn {
  border: 2px dashed var(--color-border); border-radius: 1rem;
  background: none; padding: 0.875rem; font-size: 0.9rem; font-weight: 600;
  color: var(--color-primary); cursor: pointer; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.add-floor-btn:hover { background: rgba(59,130,246,.05); border-color: var(--color-primary); }

.hint-msg { font-size: 0.85rem; color: var(--color-muted); margin: 0; }
</style>

<style>
.overlay { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,.5) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 99999 !important; padding: 1rem !important; }
.modal { display: block !important; background: #fff !important; border-radius: 1rem !important; width: 100% !important; max-width: 38rem !important; box-shadow: 0 8px 40px rgba(0,0,0,.28) !important; max-height: 90vh !important; overflow-y: auto !important; }
</style>
