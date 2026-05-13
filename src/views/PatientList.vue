<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { patients } from '@/data.js';
import { useFilterStore } from '@/stores/filter.js';
import AppHeader from '@/components/AppHeader.vue';
import SearchBar from '@/components/SearchBar.vue';
import PatientCard from '@/components/PatientCard.vue';

const router = useRouter();
const filterStore = useFilterStore();
const { searchQuery } = storeToRefs(filterStore);

const filteredPatients = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return patients;
  return patients.filter((p) => {
    const fullName = `${p.vorname} ${p.nachname}`.toLowerCase();
    return (
      fullName.includes(q) ||
      p.versicherungsnr.toLowerCase().includes(q) ||
      (p.klinikum && p.klinikum.toLowerCase().includes(q))
    );
  });
});

function openDetail(patient) {
  router.push({ name: 'patient-detail', params: { id: patient.id } });
}

function addPatient() {
  alert('Patient anlegen ist noch nicht implementiert (kommt in Iteration 9).');
}
</script>

<template>
  <AppHeader title="Patientenverwaltung" :show-back="false" />

  <main class="container">
    <SearchBar v-model="searchQuery" placeholder="Patient suchen..." />

    <ul v-if="filteredPatients.length" class="patient-list">
      <PatientCard
        v-for="patient in filteredPatients"
        :key="patient.id"
        :patient="patient"
        @click="openDetail"
      />
    </ul>
    <p v-else class="empty-state">Keine Patienten gefunden.</p>
  </main>

  <button class="fab" aria-label="Patient hinzufügen" @click="addPatient">
    <i class="bi bi-plus-lg"></i>
  </button>
</template>

<style scoped>
.empty-state {
  text-align: center;
  color: var(--color-muted);
  margin-top: 2rem;
}
</style>
