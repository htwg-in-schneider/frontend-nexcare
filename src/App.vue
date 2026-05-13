<script setup>
import { ref } from 'vue';
import { patients } from './data.js';
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import SearchBar from './components/SearchBar.vue';
import PatientCard from './components/PatientCard.vue';

const searchQuery = ref('');

function getPatients() {
  return patients;
}

function showDetails(patient) {
  alert(`${patient.vorname} ${patient.nachname} (${patient.versicherungsnr})`);
}
</script>

<template>
  <AppHeader title="Patientenverwaltung" />

  <main class="container">
    <SearchBar v-model="searchQuery" placeholder="Patient suchen..." />

    <ul class="patient-list">
      <PatientCard
        v-for="patient in getPatients()"
        :key="patient.id"
        :patient="patient"
        @click="showDetails"
      />
    </ul>
  </main>

  <button class="fab" aria-label="Patient hinzufügen">
    <i class="bi bi-plus-lg"></i>
  </button>

  <BottomNav active="patienten" />
</template>

<style scoped></style>
