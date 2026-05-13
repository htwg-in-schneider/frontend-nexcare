<script setup>
const props = defineProps({
  patient: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);

function getInitials(p) {
  return (p.vorname.charAt(0) + p.nachname.charAt(0)).toUpperCase();
}

function statusClass(status) {
  return status === 'Stationär' ? 'status-stationaer' : 'status-ambulant';
}
</script>

<template>
  <li class="patient-card" @click="$emit('click', patient)">
    <div class="avatar">{{ getInitials(patient) }}</div>
    <div class="patient-info">
      <div class="patient-name">{{ patient.vorname }} {{ patient.nachname }}</div>
      <div class="patient-meta">{{ patient.versicherungsnr }} · {{ patient.klinikum }}</div>
    </div>
    <span class="status-badge" :class="statusClass(patient.status)">{{ patient.status }}</span>
    <i class="bi bi-chevron-right chevron"></i>
  </li>
</template>

<style scoped></style>
