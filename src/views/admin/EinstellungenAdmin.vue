<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { fetchSettings, updateSetting } from '@/api/settings.js'

const ui = useUiStore()

const adminEmail = ref('')
const saving = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    const settings = await fetchSettings()
    const found = settings.find(s => s.settingKey === 'admin.email')
    adminEmail.value = found?.settingValue ?? ''
  } catch {
    ui.showToast('Einstellungen konnten nicht geladen werden.', { variant: 'error' })
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await updateSetting('admin.email', adminEmail.value.trim())
    ui.showToast('Einstellungen gespeichert.', { variant: 'success' })
  } catch {
    ui.showToast('Fehler beim Speichern.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppHeader title="Einstellungen" :show-back="true" back-route="/admin" />

  <main class="container">
    <p v-if="loading" class="state-msg">Lade …</p>

    <form v-else class="settings-form" @submit.prevent="save" novalidate>
      <fieldset>
        <legend>E-Mail-Konfiguration</legend>

        <label>
          <span>Admin-E-Mail-Adresse</span>
          <input
            v-model="adminEmail"
            type="email"
            title="E-Mail-Adresse, an die Kontaktanfragen aus dem Patientenportal gesendet werden"
            placeholder="admin@klinikum.de"
            maxlength="150"
          />
          <span class="hint">An diese Adresse werden Kontaktformular-Nachrichten aus dem Patientenportal weitergeleitet.</span>
        </label>
      </fieldset>

      <div class="info-card">
        <i class="bi bi-info-circle-fill"></i>
        <div>
          <strong>Proton SMTP</strong><br />
          E-Mails werden über den konfigurierten Proton-Account versendet.<br />
          Die Zugangsdaten werden über die Umgebungsvariablen
          <code>PROTON_SMTP_USER</code> und <code>PROTON_SMTP_PASSWORD</code> gesetzt.
        </div>
      </div>

      <button type="submit" class="app-btn app-btn-primary" :disabled="saving">
        {{ saving ? 'Speichern …' : 'Speichern' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 42rem; margin: 0 auto; }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

.settings-form { display: flex; flex-direction: column; gap: 1rem; }

fieldset {
  border: 0;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.25rem 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
legend { font-size: 1rem; font-weight: 700; color: var(--color-primary); padding: 0 0.25rem; margin-bottom: 0.25rem; }

label { display: flex; flex-direction: column; gap: 0.25rem; }
label > span { font-size: 0.85rem; color: var(--color-muted); font-weight: 500; }

input {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem; color: var(--color-text); font-family: inherit; background: #fff;
}
input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }

.hint { font-size: 0.78rem; color: var(--color-muted); }

.info-card {
  display: flex; gap: 0.875rem; align-items: flex-start;
  background: #edf4ff; border: 0.0625rem solid #bfdbfe;
  border-radius: var(--radius-card); padding: 1rem 1.125rem;
  font-size: 0.85rem; color: #1b4f8a; line-height: 1.5;
}
.info-card i { font-size: 1.1rem; margin-top: 0.1rem; flex-shrink: 0; }
code { background: #dbeafe; padding: 0.1rem 0.35rem; border-radius: 0.25rem; font-size: 0.82rem; }

.app-btn { width: 100%; padding: 0.875rem 1.25rem; border: 0; border-radius: var(--radius-card); font-size: 1rem; font-weight: 600; cursor: pointer; }
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.app-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
