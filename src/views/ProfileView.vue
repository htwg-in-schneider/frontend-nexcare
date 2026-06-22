<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import AppHeader from '@/components/AppHeader.vue'
import { fetchProfile, updateProfile, updateMeinPatient } from '@/api/profile.js'
import { fetchPatient } from '@/api/patients.js'
import { useUiStore } from '@/stores/ui.js'
import { useUserStore } from '@/stores/user.js'

const { user: auth0User } = useAuth0()
const ui = useUiStore()
const userStore = useUserStore()

const profile = ref(null)
const patientData = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await fetchProfile()
    profile.value = { ...data }

    if (userStore.isPatient && data.patientId) {
      patientData.value = await fetchPatient(data.patientId)
    }
  } catch {
    profile.value = { name: auth0User.value?.name ?? '', email: auth0User.value?.email ?? '' }
    error.value = 'Profil konnte nicht vom Server geladen werden.'
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    if (userStore.isPatient && patientData.value) {
      await updateMeinPatient({
        vorname: patientData.value.vorname,
        nachname: patientData.value.nachname,
        email: patientData.value.email,
        telefon: patientData.value.telefon,
        adresse: patientData.value.adresse,
      })
      ui.showToast('Profil gespeichert.', { variant: 'success' })
    } else {
      if (!profile.value.name?.trim()) {
        ui.showToast('Name ist erforderlich.', { variant: 'error' })
        saving.value = false
        return
      }
      const updated = await updateProfile({
        name: profile.value.name.trim(),
        adresse: profile.value.adresse,
      })
      profile.value = { ...updated }
      ui.showToast('Profil gespeichert.', { variant: 'success' })
    }
  } catch {
    ui.showToast('Fehler beim Speichern.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppHeader title="Mein Profil" :show-back="true" :back-route="userStore.isPatient ? '/portal' : '/dashboard'" />

  <main class="container">
    <p v-if="loading" class="state-msg">Lade Profil …</p>

    <template v-else>
      <p v-if="error" class="state-msg error">{{ error }}</p>

      <!-- Patient: zeigt/bearbeitet Patient-Daten direkt -->
      <form v-if="userStore.isPatient && patientData" class="profile-form" @submit.prevent="save">
        <fieldset>
          <legend>Meine Daten</legend>

          <div class="row-2">
            <label>
              <span>Vorname</span>
              <input v-model="patientData.vorname" type="text" required placeholder="Maria" maxlength="100" />
            </label>
            <label>
              <span>Nachname</span>
              <input v-model="patientData.nachname" type="text" required placeholder="Schmidt" maxlength="100" />
            </label>
          </div>

          <label>
            <span>E-Mail</span>
            <input v-model="patientData.email" type="email" placeholder="maria@beispiel.de" maxlength="150" />
          </label>

          <label>
            <span>Telefon</span>
            <input v-model="patientData.telefon" type="tel" placeholder="+49 170 1234567" maxlength="20" />
          </label>

          <label>
            <span>Adresse</span>
            <input v-model="patientData.adresse" type="text" placeholder="Musterstr. 12, 78462 Konstanz" maxlength="250" />
          </label>
        </fieldset>

        <button type="submit" class="app-btn app-btn-primary" :disabled="saving">
          {{ saving ? 'Speichern …' : 'Speichern' }}
        </button>
      </form>

      <!-- Staff/Admin: zeigt AppUser-Daten -->
      <form v-else-if="profile" class="profile-form" @submit.prevent="save">
        <fieldset>
          <legend>Persönliche Daten</legend>

          <label>
            <span>Name</span>
            <input v-model="profile.name" type="text" required placeholder="Max Mustermann" />
          </label>

          <label>
            <span>E-Mail</span>
            <input :value="profile.email" type="email" disabled />
          </label>

          <label>
            <span>Adresse</span>
            <input v-model="profile.adresse" type="text" placeholder="Musterstraße 1, 78462 Konstanz" />
          </label>

          <label v-if="userStore.isAdmin">
            <span>Rolle</span>
            <input :value="profile.role" type="text" disabled />
          </label>
        </fieldset>

        <button type="submit" class="app-btn app-btn-primary" :disabled="saving">
          {{ saving ? 'Speichern …' : 'Speichern' }}
        </button>
      </form>
    </template>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 42rem; margin: 0 auto; }

.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }
.state-msg.error { color: #b3372e; }

.profile-form { display: flex; flex-direction: column; gap: 1rem; }

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
label > span { font-size: 0.85rem; color: var(--color-muted); }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
@media (max-width: 28rem) { .row-2 { grid-template-columns: 1fr; } }

input {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem;
  color: var(--color-text);
  font-family: inherit;
  background: #fff;
}
input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
input:disabled { background: var(--color-surface); color: var(--color-muted); cursor: not-allowed; }

.app-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: var(--radius-card);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.app-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
