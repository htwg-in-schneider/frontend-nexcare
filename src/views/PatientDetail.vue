<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { fetchPatient, entlassenPatient } from '@/api/patients.js';
import { useUiStore } from '@/stores/ui.js';
import AppHeader from '@/components/AppHeader.vue';
import Avatar from '@/components/Avatar.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Button from '@/components/Button.vue';

const props = defineProps({
  id: { type: Number, required: true },
});

const router = useRouter();
const ui = useUiStore();
const { isAuthenticated } = useAuth0();
const patient = ref(null);
const loading = ref(false);
const error = ref(null);

async function loadPatient(id) {
  loading.value = true;
  error.value = null;
  patient.value = null;
  try {
    patient.value = await fetchPatient(id);
  } catch (err) {
    error.value = err.message ?? 'Patient konnte nicht geladen werden.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadPatient(props.id));
watch(() => props.id, (newId) => loadPatient(newId));

function getInitials(p) {
  return ((p?.vorname?.charAt(0) ?? '?') + (p?.nachname?.charAt(0) ?? '?')).toUpperCase();
}

const geburtsdatumDe = computed(() => {
  const iso = patient.value?.geburtsdatum;
  if (!iso) return '–';
  return new Intl.DateTimeFormat('de-DE').format(new Date(iso + 'T00:00:00Z'));
});

function goBack() {
  router.push({ name: 'patient-list' });
}

function editPatient() {
  router.push({ name: 'patient-edit', params: { id: props.id } });
}

function showMedikamentenplan() {
  router.push({ name: 'medikamentenplan', params: { patientId: props.id } });
}

async function dischargePatient() {
  const ok = await ui.confirm({
    title: 'Patient entlassen',
    message: `${patient.value.vorname} ${patient.value.nachname} als entlassen markieren?`,
    confirmLabel: 'Entlassen',
    cancelLabel: 'Abbrechen',
  });
  if (!ok) return;
  try {
    const updated = await entlassenPatient(props.id);
    patient.value = updated;
    ui.showToast('Patient wurde entlassen.');
  } catch (err) {
    ui.showToast(`Fehler beim Entlassen: ${err.message ?? err}`, { variant: 'error' });
  }
}
</script>

<template>
  <AppHeader title="Patientendetail" @back="goBack" />

  <main class="container detail-container">
    <p v-if="loading" class="state-message">Lade Patient …</p>
    <p v-else-if="error" class="state-message error">
      Patient konnte nicht geladen werden: {{ error }}
    </p>

    <template v-else-if="patient">
      <section class="patient-hero">
        <Avatar :initials="getInitials(patient)" class="hero-avatar" />
        <div class="hero-info">
          <h2 class="hero-name">{{ patient.vorname }} {{ patient.nachname }}</h2>
          <StatusBadge :status="patient.status" />
        </div>
        <button v-if="isAuthenticated" class="edit-btn" aria-label="Bearbeiten" @click="editPatient">
          <i class="bi bi-pencil"></i>
        </button>
      </section>

      <h3 class="section-title">Persönliche Daten</h3>
      <dl class="info-card">
        <div class="info-row"><dt>Geburtsdatum</dt><dd>{{ geburtsdatumDe }}</dd></div>
        <div class="info-row"><dt>Versicherungsnr.</dt><dd>{{ patient.versicherungsnr }}</dd></div>
        <div class="info-row"><dt>Telefon</dt><dd><a :href="`tel:${patient.telefon}`">{{ patient.telefon }}</a></dd></div>
        <div class="info-row"><dt>E-Mail</dt><dd><a :href="`mailto:${patient.email}`">{{ patient.email }}</a></dd></div>
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
        <div class="info-row"><dt>Telefon</dt><dd><a :href="`tel:${patient.notfallkontakt.telefon}`">{{ patient.notfallkontakt.telefon }}</a></dd></div>
      </dl>

      <div class="action-buttons">
        <Button variant="primary" @click="showMedikamentenplan">Medikamentenplan</Button>
        <Button v-if="isAuthenticated" variant="primary" @click="dischargePatient">Patient entlassen</Button>
      </div>
    </template>

    <p v-else class="state-message">Patient nicht gefunden.</p>
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
  flex: 1;
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
.edit-btn {
  background: none;
  border: 0;
  font-size: 1.15rem;
  color: var(--color-primary);
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
}
.edit-btn:hover { background: var(--color-bg); }

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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: 1.25rem;
}
.action-buttons > * { flex: 1; min-width: 10rem; }
@media (max-width: 30em) {
  .action-buttons { flex-direction: column; }
  .action-buttons > * { min-width: unset; }
}

.state-message {
  text-align: center;
  color: var(--color-muted);
  margin-top: 2rem;
}
.state-message.error { color: #b3372e; }

@media (max-width: 23.74em) {
  .info-row {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
