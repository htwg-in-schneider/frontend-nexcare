<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createPatient } from '@/api/patients.js';
import { useUiStore } from '@/stores/ui.js';
import AppHeader from '@/components/AppHeader.vue';
import PatientForm from '@/components/PatientForm.vue';

const router = useRouter();
const ui = useUiStore();

const patient = ref({
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  versicherungsnr: '',
  telefon: '',
  email: '',
  adresse: '',
  klinikumId: null,
  etage: '',
  abteilung: '',
  station: '',
  zimmer: '',
  bett: '',
  status: 'Stationär',
  notfallkontakt: { name: '', beziehung: '', telefon: '' },
});

const saving = ref(false);

async function onSubmit() {
  saving.value = true;
  try {
    const created = await createPatient(patient.value);
    ui.showToast(`Patient ${created.vorname} ${created.nachname} wurde angelegt.`);
    router.push({ name: 'patient-list' });
  } catch (err) {
    ui.showToast(`Fehler beim Anlegen: ${err.message ?? err}`, { variant: 'error' });
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  router.push({ name: 'patient-list' });
}
</script>

<template>
  <AppHeader title="Neuer Patient" @back="onCancel" />

  <main class="container detail-container">
    <PatientForm v-model="patient" submit-label="Anlegen" @submit="onSubmit">
      <template #actions>
        <button type="submit" class="app-btn app-btn-primary" :disabled="saving">
          {{ saving ? 'Speichere …' : 'Anlegen' }}
        </button>
      </template>
    </PatientForm>
  </main>
</template>

<style scoped>
.detail-container {
  padding-top: 1rem;
  padding-bottom: 1.5rem;
}
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
.app-btn-primary:hover { background: var(--color-primary-dark); }
.app-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
</style>
