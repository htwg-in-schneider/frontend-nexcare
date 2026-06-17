<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { fetchMedikamente, createMedikament, updateMedikament, archiviereMedikament } from '@/api/medikamente.js'

const ui = useUiStore()
const medikamente = ref([])
const search = ref('')
const loading = ref(false)
const modal = ref(null) // null | { id?, name, wirkstoff, beschreibung, dosiereinheit }
const saving = ref(false)

async function load() {
  loading.value = true
  try { medikamente.value = await fetchMedikamente() } catch { medikamente.value = [] } finally { loading.value = false }
}

onMounted(load)

const filtered = () =>
  medikamente.value.filter(m =>
    !search.value ||
    m.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    m.wirkstoff?.toLowerCase().includes(search.value.toLowerCase())
  )

function openCreate() {
  modal.value = { name: '', wirkstoff: '', beschreibung: '', dosiereinheit: '' }
}

function openEdit(m) {
  modal.value = { id: m.id, name: m.name, wirkstoff: m.wirkstoff, beschreibung: m.beschreibung ?? '', dosiereinheit: m.dosiereinheit ?? '' }
}

function closeModal() { modal.value = null }

async function saveModal() {
  if (!modal.value.name.trim() || !modal.value.wirkstoff.trim()) {
    ui.showToast('Name und Wirkstoff sind erforderlich.', { variant: 'error' })
    return
  }
  saving.value = true
  try {
    const data = { name: modal.value.name.trim(), wirkstoff: modal.value.wirkstoff.trim(), beschreibung: modal.value.beschreibung, dosiereinheit: modal.value.dosiereinheit }
    if (modal.value.id) {
      await updateMedikament(modal.value.id, data)
    } else {
      await createMedikament(data)
    }
    ui.showToast('Medikament gespeichert.', { variant: 'success' })
    closeModal()
    await load()
  } catch {
    ui.showToast('Fehler beim Speichern.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}

async function onArchivieren(m) {
  const ok = await ui.confirm({
    title: 'Medikament archivieren',
    message: `„${m.name}" archivieren? Es wird nicht mehr im Katalog angezeigt.`,
    confirmLabel: 'Archivieren',
    cancelLabel: 'Abbrechen',
  })
  if (!ok) return
  try {
    await archiviereMedikament(m.id)
    ui.showToast('Medikament archiviert.')
    await load()
  } catch {
    ui.showToast('Fehler beim Archivieren.', { variant: 'error' })
  }
}
</script>

<template>
  <AppHeader title="Medikamentenverwaltung" :show-back="true" back-route="/admin" />

  <main class="container">
    <div class="toolbar">
      <div class="search-wrap">
        <i class="bi bi-search search-icon"></i>
        <input v-model="search" type="search" placeholder="Name oder Wirkstoff suchen …" class="search-input" />
      </div>
      <button class="add-btn" @click="openCreate">
        <i class="bi bi-plus-lg"></i> Neu
      </button>
    </div>

    <p v-if="loading" class="state-msg">Lade …</p>
    <p v-else-if="!filtered().length" class="state-msg">Keine Medikamente gefunden.</p>

    <ul v-else class="med-list">
      <li v-for="m in filtered()" :key="m.id" class="med-item">
        <div class="med-info">
          <span class="med-name">{{ m.name }}</span>
          <span class="med-wirkstoff">{{ m.wirkstoff }}</span>
          <span v-if="m.beschreibung" class="med-beschreibung">{{ m.beschreibung }}</span>
        </div>
        <span v-if="m.dosiereinheit" class="med-einheit">{{ m.dosiereinheit }}</span>
        <div class="med-actions">
          <button class="icon-btn" title="Bearbeiten" @click="openEdit(m)"><i class="bi bi-pencil"></i></button>
          <button class="icon-btn danger" title="Archivieren" @click="onArchivieren(m)"><i class="bi bi-archive"></i></button>
        </div>
      </li>
    </ul>
  </main>

  <Teleport to="body">
    <div v-if="modal" class="overlay" @click.self="closeModal">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>{{ modal.id ? 'Medikament bearbeiten' : 'Medikament anlegen' }}</h3>
          <button class="close-btn" @click="closeModal" aria-label="Schließen">✕</button>
        </div>
        <div class="modal-body">
          <label><span>Name *</span><input v-model.trim="modal.name" type="text" placeholder="Ibuprofen 400mg" /></label>
          <label><span>Wirkstoff *</span><input v-model.trim="modal.wirkstoff" type="text" placeholder="Ibuprofen" /></label>
          <label><span>Beschreibung</span><input v-model.trim="modal.beschreibung" type="text" placeholder="Kurze Beschreibung …" /></label>
          <label><span>Dosiereinheit</span><input v-model.trim="modal.dosiereinheit" type="text" placeholder="mg / ml / Stk" /></label>
        </div>
        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="closeModal" :disabled="saving">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="saveModal" :disabled="saving">
            {{ saving ? 'Speichern …' : 'Speichern' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 48rem; margin: 0 auto; }
.toolbar { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center; }
.search-wrap { position: relative; flex: 1; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-muted); font-size: 0.9rem; }
.search-input { width: 100%; padding: 0.625rem 0.75rem 0.625rem 2.25rem; border: 0.0625rem solid var(--color-border); border-radius: 0.625rem; font-size: 0.95rem; font-family: inherit; background: #fff; color: var(--color-text); }
.search-input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.add-btn { display: flex; align-items: center; gap: 0.375rem; padding: 0.625rem 1rem; background: var(--color-primary); color: #fff; border: none; border-radius: 0.625rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.add-btn:hover { filter: brightness(1.08); }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }
.med-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.med-item { background: var(--color-card); border: 0.0625rem solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-card); display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; }
.med-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.med-name { font-weight: 700; font-size: 0.9rem; color: var(--color-text); }
.med-wirkstoff { font-size: 0.8rem; color: var(--color-primary); font-weight: 600; }
.med-beschreibung { font-size: 0.78rem; color: var(--color-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.med-einheit { font-size: 0.78rem; color: var(--color-muted); white-space: nowrap; flex-shrink: 0; }
.med-actions { display: flex; gap: 0.375rem; flex-shrink: 0; }
.icon-btn { width: 2.1rem; height: 2.1rem; border-radius: 0.5rem; border: 0.0625rem solid var(--color-border); background: var(--color-surface); color: var(--color-text); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem; }
.icon-btn:hover { background: var(--color-card); }
.icon-btn.danger:hover { color: #b3372e; border-color: #f5c2be; background: #fdf0ef; }
</style>

