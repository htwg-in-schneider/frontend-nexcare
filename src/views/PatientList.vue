<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { storeToRefs } from 'pinia';
import { fetchPatients } from '@/api/patients.js';
import { useFilterStore } from '@/stores/filter.js';
import AppHeader from '@/components/AppHeader.vue';
import SearchBar from '@/components/SearchBar.vue';
import PatientFilter from '@/components/PatientFilter.vue';
import PatientCard from '@/components/PatientCard.vue';

const router = useRouter();
const { isAuthenticated } = useAuth0();
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
  router.push({ name: 'aufnahme-1' });
}
</script>

<template>
  <AppHeader title="Patientenverwaltung" :show-back="false" />

  <main class="container">
    <SearchBar v-model="searchQuery" placeholder="Patient suchen..." />
    <PatientFilter />

    <ul v-if="loading" class="patient-list skeleton-list" aria-hidden="true">
      <li v-for="n in 5" :key="n" class="skeleton-card">
        <div class="sk-avatar"></div>
        <div class="sk-lines">
          <div class="sk-line sk-name"></div>
          <div class="sk-line sk-sub"></div>
        </div>
      </li>
    </ul>
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

  <button v-if="isAuthenticated" class="fab" aria-label="Patient hinzufügen" @click="addPatient">
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

.skeleton-list { list-style: none; padding: 0; margin: 0.5rem 0; display: flex; flex-direction: column; gap: 0.625rem; }
.skeleton-card {
  display: flex; align-items: center; gap: 1rem;
  background: var(--color-card); border-radius: var(--radius-card);
  padding: 0.875rem 1rem; box-shadow: var(--shadow-card);
}
.sk-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; flex-shrink: 0; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.sk-line { height: 0.8rem; border-radius: 0.4rem; }
.sk-name { width: 55%; }
.sk-sub  { width: 35%; }
.sk-avatar, .sk-line {
  background: linear-gradient(90deg, var(--color-border, #e2e8f0) 25%, #f0f4f8 50%, var(--color-border, #e2e8f0) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
