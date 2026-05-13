<script setup>
import { patients } from './data.js';

function getPatients() {
  return patients;
}

function getInitials(patient) {
  return (patient.vorname.charAt(0) + patient.nachname.charAt(0)).toUpperCase();
}

function statusClass(status) {
  return status === 'Stationär' ? 'status-stationaer' : 'status-ambulant';
}

function showDetails(patient) {
  alert(`${patient.vorname} ${patient.nachname} (${patient.versicherungsnr})`);
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <button class="back-btn" aria-label="Zurück">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h1 class="header-title">Patientenverwaltung</h1>
    </div>
  </header>

  <main class="container">
    <div class="search-wrapper">
      <i class="bi bi-search"></i>
      <input type="text" class="search-input" placeholder="Patient suchen..." />
    </div>

    <ul class="patient-list">
      <li
        v-for="patient in getPatients()"
        :key="patient.id"
        class="patient-card"
        @click="showDetails(patient)"
      >
        <div class="avatar">{{ getInitials(patient) }}</div>
        <div class="patient-info">
          <div class="patient-name">{{ patient.vorname }} {{ patient.nachname }}</div>
          <div class="patient-meta">{{ patient.versicherungsnr }} · {{ patient.klinikum }}</div>
        </div>
        <span class="status-badge" :class="statusClass(patient.status)">{{ patient.status }}</span>
        <i class="bi bi-chevron-right chevron"></i>
      </li>
    </ul>
  </main>

  <button class="fab" aria-label="Patient hinzufügen">
    <i class="bi bi-plus-lg"></i>
  </button>

  <nav class="bottom-nav" aria-label="Hauptnavigation">
    <div class="nav-inner">
      <a href="#" class="nav-item">
        <i class="bi bi-house"></i>
        <span>Home</span>
      </a>
      <a href="#" class="nav-item active">
        <i class="bi bi-person-fill"></i>
        <span>Patienten</span>
      </a>
      <a href="#" class="nav-item">
        <i class="bi bi-square"></i>
        <span>Betten</span>
      </a>
      <a href="#" class="nav-item">
        <i class="bi bi-person"></i>
        <span>Account</span>
      </a>
    </div>
  </nav>
</template>

<style scoped></style>
