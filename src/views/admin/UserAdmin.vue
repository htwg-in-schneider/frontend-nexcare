<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { fetchUsers, updateUser } from '@/api/admin.js'

const ui = useUiStore()

const users = ref([])
const search = ref('')
const loading = ref(false)
const modal = ref(null) // null | { id, name, adresse, role, email }
const saving = ref(false)

async function load() {
  loading.value = true
  try { users.value = await fetchUsers() } catch { users.value = [] } finally { loading.value = false }
}

onMounted(load)

const filtered = () =>
  users.value.filter((u) =>
    !search.value ||
    u.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.value.toLowerCase())
  )

function openEdit(u) {
  modal.value = { id: u.id, name: u.name ?? '', adresse: u.adresse ?? '', role: u.role ?? 'REGULAR', email: u.email }
}

function closeModal() { modal.value = null }

async function saveModal() {
  if (!modal.value.name.trim()) {
    ui.showToast('Name darf nicht leer sein.', { variant: 'error' })
    return
  }
  saving.value = true
  try {
    await updateUser(modal.value.id, { name: modal.value.name.trim(), adresse: modal.value.adresse, role: modal.value.role })
    ui.showToast('Benutzer gespeichert.', { variant: 'success' })
    closeModal()
    await load()
  } catch {
    ui.showToast('Fehler beim Speichern.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}

function roleLabel(role) {
  return role === 'ADMIN' ? 'Admin' : 'Benutzer'
}
</script>

<template>
  <AppHeader title="Benutzerverwaltung" :show-back="true" back-route="/admin" />

  <main class="container">
    <div class="toolbar">
      <div class="search-wrap">
        <i class="bi bi-search search-icon"></i>
        <input
          v-model="search"
          type="search"
          placeholder="Name oder E-Mail suchen …"
          class="search-input"
        />
      </div>
    </div>

    <p v-if="loading" class="state-msg">Lade …</p>
    <p v-else-if="!filtered().length" class="state-msg">Keine Benutzer gefunden.</p>

    <ul v-else class="user-list">
      <li v-for="u in filtered()" :key="u.id" class="user-item">
        <div class="user-avatar">{{ (u.name ?? '?').charAt(0).toUpperCase() }}</div>
        <div class="user-info">
          <span class="user-name">{{ u.name }}</span>
          <span class="user-email">{{ u.email }}</span>
        </div>
        <span class="role-badge" :class="u.role === 'ADMIN' ? 'admin' : 'regular'">
          {{ roleLabel(u.role) }}
        </span>
        <button class="icon-btn" aria-label="Bearbeiten" @click="openEdit(u)">
          <i class="bi bi-pencil"></i>
        </button>
      </li>
    </ul>
  </main>

  <!-- Edit Modal -->
  <Teleport to="body">
    <div v-if="modal" class="overlay" @click.self="closeModal">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>Benutzer bearbeiten</h3>
          <button class="close-btn" @click="closeModal" aria-label="Schließen">✕</button>
        </div>
        <div class="modal-body">
          <label>
            <span>E-Mail</span>
            <input :value="modal.email" type="email" disabled />
          </label>
          <label>
            <span>Name *</span>
            <input v-model.trim="modal.name" type="text" required />
          </label>
          <label>
            <span>Adresse</span>
            <input v-model.trim="modal.adresse" type="text" placeholder="Musterstraße 1, 78462 Konstanz" />
          </label>
          <label>
            <span>Rolle</span>
            <select v-model="modal.role">
              <option value="REGULAR">Benutzer</option>
              <option value="ADMIN">Admin</option>
            </select>
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

.toolbar { margin-bottom: 1rem; }
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-muted); font-size: 0.9rem; }
.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem; font-family: inherit;
  background: #fff; color: var(--color-text);
}
.search-input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }

.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

.user-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.user-item {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
}
.user-avatar {
  width: 2.25rem; height: 2.25rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 700;
  flex-shrink: 0;
}
.user-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.user-name { font-weight: 600; font-size: 0.9rem; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { font-size: 0.78rem; color: var(--color-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.role-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
.role-badge.admin { background: #edf4ff; color: #1b4f8a; }
.role-badge.regular { background: var(--color-surface); color: var(--color-muted); border: 0.0625rem solid var(--color-border); }

.icon-btn {
  width: 2.25rem; height: 2.25rem;
  border-radius: 0.5rem;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.9rem; flex-shrink: 0;
}
.icon-btn:hover { background: var(--color-card); }

/* Modal */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 1rem;
}
.modal {
  background: #fff; border-radius: 1rem;
  width: 100%; max-width: 28rem;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.125rem 1.5rem;
  border-bottom: 0.0625rem solid var(--color-border);
}
.modal-head h3 { margin: 0; font-size: 1rem; }
.close-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--color-muted); line-height: 1; }
.modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-body label { display: flex; flex-direction: column; gap: 0.25rem; }
.modal-body label > span { font-size: 0.85rem; color: var(--color-muted); }
.modal-body input, .modal-body select {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem; font-family: inherit;
  background: #fff; color: var(--color-text);
}
.modal-body input:disabled { background: var(--color-surface); color: var(--color-muted); cursor: not-allowed; }
.modal-body input:focus, .modal-body select:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.modal-foot {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 0.0625rem solid var(--color-border);
}
.app-btn {
  padding: 0.75rem 1.25rem;
  border: 0; border-radius: 0.625rem;
  font-size: 0.95rem; font-weight: 600;
  cursor: pointer;
}
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.app-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.app-btn-secondary { background: var(--color-surface); color: var(--color-text); border: 0.0625rem solid var(--color-border); }
.app-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
