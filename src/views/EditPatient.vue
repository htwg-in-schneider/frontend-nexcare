<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPatient, updatePatient, deletePatient } from '@/api/patients.js';
import { useUiStore } from '@/stores/ui.js';
import AppHeader from '@/components/AppHeader.vue';
import PatientForm from '@/components/PatientForm.vue';

const props = defineProps({
  id: { type: Number, required: true },
});

const router = useRouter();
const ui = useUiStore();
const patient = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref(null);

async function load(id) {
  loading.value = true;
  error.value = null;
  try {
    patient.value = await fetchPatient(id);
  } catch (err) {
    error.value = err.message ?? 'Fehler beim Laden.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => load(props.id));
watch(() => props.id, (newId) => load(newId));

async function onSave() {
  saving.value = true;
  try {
    await updatePatient(props.id, patient.value);
    ui.showToast('Änderungen gespeichert.');
    router.push({ name: 'patient-detail', params: { id: props.id } });
  } catch (err) {
    ui.showToast(`Fehler beim Speichern: ${err.message ?? err}`, { variant: 'error' });
  } finally {
    saving.value = false;
  }
}

async function onDelete() {
  const ok = await ui.confirm({
    title: 'Patient entlassen',
    message: `${patient.value.vorname} ${patient.value.nachname} wirklich löschen?`,
    confirmLabel: 'Löschen',
    cancelLabel: 'Abbrechen',
  });
  if (!ok) return;
  try {
    await deletePatient(props.id);
    ui.showToast('Patient wurde entlassen.');
    router.push({ name: 'patient-list' });
  } catch (err) {
    ui.showToast(`Fehler beim Löschen: ${err.message ?? err}`, { variant: 'error' });
  }
}

function onBack() {
  router.push({ name: 'patient-detail', params: { id: props.id } });
}
</script>

<template>
  <AppHeader title="Patient bearbeiten" @back="onBack" />

  <main class="container detail-container">
    <p v-if="loading" class="state-message">Lade Patient …</p>
    <p v-else-if="error" class="state-message error">{{ error }}</p>
    <PatientForm v-else-if="patient" v-model="patient" submit-label="Speichern" @submit="onSave">
      <template #actions>
        <button type="submit" class="app-btn app-btn-primary" :disabled="saving">
          {{ saving ? 'Speichere …' : 'Speichern' }}
        </button>
        <button type="button" class="app-btn app-btn-danger" @click="onDelete">
          Patient entlassen (löschen)
        </button>
      </template>
    </PatientForm>
  </main>
</template>

<style scoped>
.detail-container { padding-top: 1rem; padding-bottom: 1.5rem; }
.state-message { text-align: center; color: var(--color-muted); margin-top: 2rem; }
.state-message.error { color: #b3372e; }
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
.app-btn-danger { background: #b3372e; color: #fff; }
.app-btn-danger:hover { background: #8c2c25; }
.app-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
</style>
