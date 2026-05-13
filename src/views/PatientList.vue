<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { fetchPatients } from '@/api/patients.js';
import { useFilterStore } from '@/stores/filter.js';
import AppHeader from '@/components/AppHeader.vue';
import SearchBar from '@/components/SearchBar.vue';
import PatientFilter from '@/components/PatientFilter.vue';
import PatientCard from '@/components/PatientCard.vue';

const router = useRouter();
const filterStore = useFilterStore();
const { searchQuery, statusFilter, klinikumFilter } = storeToRefs(filterStore);

const patients = ref([]);
const loading = ref(false);
const error = ref(null);

let debounceTimer = null;

async function loadPatients() {
  loading.value = true;
  error.value = null;
  try {
    patients.value = await fetchPatients({
      name: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      klinikum: klinikumFilter.value || undefined,
    });
  } catch (err) {
    error.value = err.message ?? 'Unbekannter Fehler beim Laden.';
    patients.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadPatients);

watch([searchQuery, statusFilter, klinikumFilter], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadPatients, 250);
});

function openDetail(patient) {
  router.push({ name: 'patient-detail', params: { id: patient.id } });
}

function addPatient() {
  router.push({ name: 'patient-create' });
}
</script>

<template>
  <AppHeader title="Patientenverwaltung" :show-back="false" />

  <main class="container">
    <SearchBar v-model="searchQuery" placeholder="Patient suchen..." />
    <PatientFilter />

    <p v-if="loading" class="state-message">Lade Patienten …</p>
    <p v-else-if="error" class="state-message error">
      Patienten konnten nicht geladen werden: {{ error }}
    </p>
    <ul v-else-if="patients.length" class="patient-list">
      <PatientCard
        v-for="patient in patients"
        :key="patient.id"
        :patient="patient"
        @click="openDetail"
      />
    </ul>
    <p v-else class="state-message">Keine Patienten gefunden.</p>
  </main>

  <button class="fab" aria-label="Patient hinzufügen" @click="addPatient">
    <i class="bi bi-plus-lg"></i>
  </button>
</template>

<style scoped>
.state-message {
  text-align: center;
  color: var(--color-muted);
  margin-top: 2rem;
}
.state-message.error { color: #b3372e; }
</style>
