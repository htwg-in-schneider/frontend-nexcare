<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { fetchKlinika, createKlinikum, updateKlinikum, deleteKlinikum } from '@/api/klinika.js'

const ui = useUiStore()

const klinika = ref([])
const search = ref('')
const loading = ref(false)
const searchTimer = ref(null)

// Modal-State
const modal = ref(null) // null | { id: Long|null, name: '', ort: '' }
const saving = ref(false)

async function load(name = '') {
  loading.value = true
  try { klinika.value = await fetchKlinika(name) } catch { klinika.value = [] } finally { loading.value = false }
}

onMounted(() => load())

function onSearch() {
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => load(search.value), 250)
}

function openCreate() {
  modal.value = { id: null, name: '', ort: '' }
}

function openEdit(k) {
  modal.value = { id: k.id, name: k.name, ort: k.ort }
}

function closeModal() { modal.value = null }

async function saveModal() {
  if (!modal.value.name.trim() || !modal.value.ort.trim()) {
    ui.showToast('Name und Ort sind Pflichtfelder.', { variant: 'error' })
    return
  }
  saving.value = true
  try {
    if (modal.value.id == null) {
      await createKlinikum({ name: modal.value.name.trim(), ort: modal.value.ort.trim() })
      ui.showToast('Klinikum erstellt.', { variant: 'success' })
    } else {
      await updateKlinikum(modal.value.id, { name: modal.value.name.trim(), ort: modal.value.ort.trim() })
      ui.showToast('Klinikum gespeichert.', { variant: 'success' })
    }
    closeModal()
    await load(search.value)
  } catch {
    ui.showToast('Fehler beim Speichern.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}

async function remove(k) {
  const ok = await ui.confirm({
    title: 'Klinikum löschen',
    message: `„${k.name}" wirklich löschen? Zugeordnete Patienten verlieren die Klinikum-Zuweisung.`,
    confirmLabel: 'Löschen',
  })
  if (!ok) return
  try {
    await deleteKlinikum(k.id)
    ui.showToast('Klinikum gelöscht.', { variant: 'success' })
    await load(search.value)
  } catch {
    ui.showToast('Fehler beim Löschen.', { variant: 'error' })
  }
}
</script>

<template>
  <AppHeader title="Klinika" :show-back="true" back-route="/admin" />

  <main class="container">
    <!-- Suchzeile + Neu-Button -->
    <div class="toolbar">
      <div class="search-wrap">
        <i class="bi bi-search search-icon"></i>
        <input
          v-model="search"
          type="search"
          placeholder="Klinikum suchen …"
          class="search-input"
          @input="onSearch"
        />
      </div>
      <button class="app-btn app-btn-primary btn-new" @click="openCreate">
        <i class="bi bi-plus-lg"></i> Neu
      </button>
    </div>

    <p v-if="loading" class="state-msg">Lade …</p>
    <p v-else-if="!klinika.length" class="state-msg">Keine Klinika gefunden.</p>

    <!-- Mobile: Cards / Desktop: Tabelle -->
    <ul v-else class="k-list">
      <li v-for="k in klinika" :key="k.id" class="k-item">
        <div class="k-info">
          <span class="k-name">{{ k.name }}</span>
          <span class="k-ort">{{ k.ort }}</span>
        </div>
        <div class="k-actions">
          <button class="icon-btn" aria-label="Bearbeiten" @click="openEdit(k)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="icon-btn danger" aria-label="Löschen" @click="remove(k)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </li>
    </ul>
  </main>

  <!-- Modal -->
  <Teleport to="body">
    <div v-if="modal" class="overlay" @click.self="closeModal">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>{{ modal.id == null ? 'Klinikum erstellen' : 'Klinikum bearbeiten' }}</h3>
          <button class="close-btn" @click="closeModal" aria-label="Schließen">✕</button>
        </div>
        <div class="modal-body">
          <label>
            <span>Name *</span>
            <input v-model.trim="modal.name" type="text" required placeholder="Klinikum Konstanz" />
          </label>
          <label>
            <span>Ort *</span>
            <input v-model.trim="modal.ort" type="text" required placeholder="Konstanz" />
          </label>
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
.search-wrap { flex: 1; position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-muted); font-size: 0.9rem; }
.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem;
  font-family: inherit;
  background: #fff;
  color: var(--color-text);
}
.search-input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.btn-new { white-space: nowrap; }

.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

.k-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.k-item {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  gap: 0.75rem;
}
.k-info { display: flex; flex-direction: column; gap: 0.125rem; }
.k-name { font-weight: 600; font-size: 0.95rem; color: var(--color-text); }
.k-ort { font-size: 0.8rem; color: var(--color-muted); }
.k-actions { display: flex; gap: 0.5rem; }

.icon-btn {
  width: 2.25rem; height: 2.25rem;
  border-radius: 0.5rem;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.9rem;
}
.icon-btn:hover { background: var(--color-card); }
.icon-btn.danger { color: #b3372e; }
.icon-btn.danger:hover { background: #fdf2f1; border-color: #b3372e; }

</style>
