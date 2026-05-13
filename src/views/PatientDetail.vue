<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { patients } from '@/data.js';
import AppHeader from '@/components/AppHeader.vue';
import Avatar from '@/components/Avatar.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Button from '@/components/Button.vue';

const props = defineProps({
  id: { type: Number, required: true },
});

const router = useRouter();
const patient = computed(() => patients.find((p) => p.id === props.id));

function getInitials(p) {
  return (p.vorname.charAt(0) + p.nachname.charAt(0)).toUpperCase();
}

function goBack() {
  router.push({ name: 'patient-list' });
}

function showMedikamentenplan() {
  alert('Medikamentenplan ist noch nicht implementiert.');
}

function dischargePatient() {
  alert('Patient entlassen ist noch nicht implementiert (kommt in Iteration 9).');
}
</script>

<template>
  <AppHeader title="Patientendetail" @back="goBack" />

  <main v-if="patient" class="container detail-container">
    <section class="patient-hero">
      <Avatar :initials="getInitials(patient)" class="hero-avatar" />
      <div class="hero-info">
        <h2 class="hero-name">{{ patient.vorname }} {{ patient.nachname }}</h2>
        <StatusBadge :status="patient.status" />
      </div>
    </section>

    <h3 class="section-title">Persönliche Daten</h3>
    <dl class="info-card">
      <div class="info-row"><dt>Geburtsdatum</dt><dd>{{ patient.geburtsdatum }}</dd></div>
      <div class="info-row"><dt>Versicherungsnr.</dt><dd>{{ patient.versicherungsnr }}</dd></div>
      <div class="info-row"><dt>Telefon</dt><dd>{{ patient.telefon }}</dd></div>
      <div class="info-row"><dt>E-Mail</dt><dd>{{ patient.email }}</dd></div>
      <div class="info-row"><dt>Adresse</dt><dd>{{ patient.adresse }}</dd></div>
    </dl>

    <h3 class="section-title">Aktueller Aufenthalt</h3>
    <dl class="info-card">
      <div class="info-row"><dt>Krankenhaus</dt><dd>{{ patient.klinikum }}</dd></div>
      <div class="info-row"><dt>Etage</dt><dd>{{ patient.etage }}</dd></div>
      <div class="info-row"><dt>Abteilung</dt><dd>{{ patient.abteilung }}</dd></div>
      <div class="info-row"><dt>Station</dt><dd>{{ patient.station }}</dd></div>
      <div class="info-row"><dt>Zimmer</dt><dd>{{ patient.zimmer }}</dd></div>
      <div class="info-row"><dt>Bett</dt><dd>{{ patient.bett }}</dd></div>
    </dl>

    <h3 class="section-title">Notfallkontakt</h3>
    <dl class="info-card">
      <div class="info-row"><dt>Name</dt><dd>{{ patient.notfallkontakt.name }}</dd></div>
      <div class="info-row"><dt>Beziehung</dt><dd>{{ patient.notfallkontakt.beziehung }}</dd></div>
      <div class="info-row"><dt>Telefon</dt><dd>{{ patient.notfallkontakt.telefon }}</dd></div>
    </dl>

    <div class="action-buttons">
      <Button variant="primary" @click="showMedikamentenplan">Medikamentenplan</Button>
      <Button variant="primary" @click="dischargePatient">Patient entlassen</Button>
    </div>
  </main>

  <main v-else class="container detail-container">
    <p class="not-found">Patient nicht gefunden.</p>
  </main>
</template>

<style scoped>
.detail-container {
  padding-top: 1rem;
  padding-bottom: 1.5rem;
}

.patient-hero {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.25rem 1.25rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1.25rem;
}
.hero-avatar {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1rem;
}
.hero-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}
.hero-info .status-badge { align-self: flex-start; }
.hero-name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 1rem 0 0.5rem;
}

.info-card {
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  margin: 0 0 0.5rem;
  padding: 0.5rem 1rem;
}
.info-row {
  display: grid;
  grid-template-columns: minmax(7.5rem, 35%) 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 0.0625rem solid var(--color-border);
}
.info-row:last-child { border-bottom: 0; }
.info-row dt {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}
.info-row dd {
  margin: 0;
  color: var(--color-text);
  font-size: 0.95rem;
  word-break: break-word;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 1.25rem;
}

.not-found {
  text-align: center;
  color: var(--color-muted);
  margin-top: 3rem;
}

@media (max-width: 23.74em) {
  .info-row {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
