<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { patients } from '@/data.js';
import AppHeader from '@/components/AppHeader.vue';
import SearchBar from '@/components/SearchBar.vue';
import PatientCard from '@/components/PatientCard.vue';

const router = useRouter();
const searchQuery = ref('');

function getPatients() {
  return patients;
}

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

    <ul class="patient-list">
      <PatientCard
        v-for="patient in getPatients()"
        :key="patient.id"
        :patient="patient"
        @click="openDetail"
      />
    </ul>
  </main>

  <button class="fab" aria-label="Patient hinzufügen" @click="addPatient">
    <i class="bi bi-plus-lg"></i>
  </button>
</template>

<style scoped></style>
