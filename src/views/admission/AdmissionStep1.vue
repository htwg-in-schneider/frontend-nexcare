<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AdmissionStepper from '@/components/AdmissionStepper.vue'
import { useAdmissionStore } from '@/stores/admission.js'

const router = useRouter()
const admission = useAdmissionStore()

// Lokale Kopie der Felder dieses Schritts
const form = ref({
  vorname: admission.patient.vorname,
  nachname: admission.patient.nachname,
  geburtsdatum: admission.patient.geburtsdatum,
  versicherungsnr: admission.patient.versicherungsnr,
  telefon: admission.patient.telefon,
  email: admission.patient.email,
  adresse: admission.patient.adresse,
})

function next() {
  admission.updatePatient({ ...form.value })
  router.push({ name: 'aufnahme-2' })
}
</script>

<template>
  <AppHeader title="Patient aufnehmen" :show-back="true" back-route="/patients" />
  <AdmissionStepper :current-step="1" />

  <main class="container">
    <h2 class="step-title">Persönliche Daten</h2>

    <form class="admission-form" @submit.prevent="next">
      <fieldset>
        <div class="grid">
          <label>
            <span>Vorname *</span>
            <input v-model.trim="form.vorname" type="text" required placeholder="Maria" />
          </label>
          <label>
            <span>Nachname *</span>
            <input v-model.trim="form.nachname" type="text" required placeholder="Schmidt" />
          </label>
          <label>
            <span>Geburtsdatum *</span>
            <input v-model="form.geburtsdatum" type="date" required />
          </label>
          <label>
            <span>Versicherungsnr. *</span>
            <input v-model.trim="form.versicherungsnr" type="text" required placeholder="V-2025-001" />
          </label>
          <label>
            <span>Telefon</span>
            <input v-model.trim="form.telefon" type="tel" placeholder="+49 170 1234567" />
          </label>
          <label>
            <span>E-Mail</span>
            <input v-model.trim="form.email" type="email" placeholder="patient@beispiel.de" />
          </label>
          <label class="wide">
            <span>Adresse</span>
            <input v-model.trim="form.adresse" type="text" placeholder="Musterstr. 12, 78462 Konstanz" />
          </label>
        </div>
      </fieldset>

      <button type="submit" class="app-btn app-btn-primary">
        Weiter <i class="bi bi-arrow-right"></i>
      </button>
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

.app-btn {
  width: 100%;
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
.app-btn-primary:hover { background: var(--color-primary-dark); }
</style>
