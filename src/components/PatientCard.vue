<script setup>
import Avatar from './Avatar.vue';
import StatusBadge from './StatusBadge.vue';

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
</script>

<template>
  <li class="patient-card" @click="$emit('click', patient)">
    <Avatar :initials="getInitials(patient)" />
    <div class="patient-info">
      <div class="patient-name">{{ patient.vorname }} {{ patient.nachname }}</div>
      <div class="patient-meta">{{ patient.versicherungsnr }} · {{ patient.klinikum }}</div>
    </div>
    <StatusBadge :status="patient.status" />
    <i class="bi bi-chevron-right chevron"></i>
  </li>
</template>

<style scoped></style>
