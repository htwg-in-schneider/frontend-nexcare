<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AdmissionStepper from '@/components/AdmissionStepper.vue'
import { useAdmissionStore } from '@/stores/admission.js'
import { useUiStore } from '@/stores/ui.js'
import { createPatient } from '@/api/patients.js'

const router = useRouter()
const admission = useAdmissionStore()
const ui = useUiStore()

// Schritt 2 muss abgeschlossen sein
if (!admission.patient.vorname) {
  router.replace({ name: 'aufnahme-1' })
}

const notfall = ref({ ...admission.patient.notfallkontakt })
const saving = ref(false)

function back() {
  router.push({ name: 'aufnahme-2' })
}

async function submit() {
  saving.value = true
  admission.updatePatient({ notfallkontakt: { ...notfall.value } })
  try {
    const saved = await createPatient(admission.patient)
    admission.reset()
    ui.showToast(`Patient ${saved.vorname} ${saved.nachname} erfolgreich aufgenommen.`, { variant: 'success' })
    router.push({ name: 'patient-detail', params: { id: saved.id } })
  } catch {
    ui.showToast('Fehler beim Speichern. Bitte Pflichtfelder prüfen.', { variant: 'error' })
  } finally {
    saving.value = false
  }
}

const p = admission.patient
</script>

<template>
  <AppHeader title="Patient aufnehmen" :show-back="false" />
  <AdmissionStepper :current-step="3" />

  <main class="container">
    <h2 class="step-title">Notfallkontakt &amp; Bestätigung</h2>

    <form class="admission-form" @submit.prevent="submit">
      <!-- Notfallkontakt -->
      <fieldset>
        <legend>Notfallkontakt</legend>
        <div class="grid">
          <label>
            <span>Name</span>
            <input v-model.trim="notfall.name" type="text" placeholder="Hans Schmidt" />
          </label>
          <label>
            <span>Beziehung</span>
            <input v-model.trim="notfall.beziehung" type="text" placeholder="Ehepartner" />
          </label>
          <label class="wide">
            <span>Telefon</span>
            <input v-model.trim="notfall.telefon" type="tel" placeholder="+49 170 7654321" />
          </label>
        </div>
      </fieldset>

      <!-- Zusammenfassung -->
      <section class="summary">
        <h3>Zusammenfassung</h3>
        <dl>
          <div class="row"><dt>Name</dt><dd>{{ p.vorname }} {{ p.nachname }}</dd></div>
          <div class="row"><dt>Geburtsdatum</dt><dd>{{ p.geburtsdatum }}</dd></div>
          <div class="row"><dt>Versicherungsnr.</dt><dd>{{ p.versicherungsnr }}</dd></div>
          <div class="row"><dt>Status</dt><dd>{{ p.status }}</dd></div>
          <div class="row"><dt>Klinikum-ID</dt><dd>{{ p.klinikumId ?? '–' }}</dd></div>
          <div class="row"><dt>Etage / Abteilung</dt><dd>{{ p.etage || '–' }} / {{ p.abteilung || '–' }}</dd></div>
          <div class="row"><dt>Station / Zimmer / Bett</dt><dd>{{ p.station || '–' }} / {{ p.zimmer || '–' }} / {{ p.bett || '–' }}</dd></div>
        </dl>
      </section>

      <div class="btn-row">
        <button type="button" class="app-btn app-btn-secondary" @click="back" :disabled="saving">
          <i class="bi bi-arrow-left"></i> Zurück
        </button>
        <button type="submit" class="app-btn app-btn-primary" :disabled="saving">
          {{ saving ? 'Speichern …' : 'Patient aufnehmen' }}
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 42rem; margin: 0 auto; }
.step-title { font-size: 1.125rem; font-weight: 700; margin: 1rem 0 0.75rem; color: var(--color-text); }

.admission-form { display: flex; flex-direction: column; gap: 1rem; }

fieldset {
  border: 0;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.25rem 1.25rem;
  margin: 0;
}
legend { font-size: 1rem; font-weight: 700; color: var(--color-primary); padding: 0 0.25rem; margin-bottom: 0.5rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0.875rem 1rem;
}
.wide { grid-column: 1 / -1; }

label { display: flex; flex-direction: column; gap: 0.25rem; }
label > span { font-size: 0.85rem; color: var(--color-muted); }

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

/* Zusammenfassung */
.summary {
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.25rem;
}
.summary h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-primary); margin: 0 0 0.75rem; }
dl { margin: 0; }
.row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 0.0625rem solid var(--color-border); gap: 1rem; }
.row:last-child { border-bottom: none; }
dt { font-size: 0.85rem; color: var(--color-muted); white-space: nowrap; }
dd { font-size: 0.875rem; margin: 0; text-align: right; word-break: break-word; }

.btn-row { display: flex; gap: 0.75rem; }
.app-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: var(--radius-card);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.app-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.app-btn-secondary { background: var(--color-surface); color: var(--color-text); border: 0.0625rem solid var(--color-border); }
.app-btn-secondary:hover:not(:disabled) { background: var(--color-card); }
.app-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
