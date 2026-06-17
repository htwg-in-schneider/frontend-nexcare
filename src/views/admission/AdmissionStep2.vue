<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AdmissionStepper from '@/components/AdmissionStepper.vue'
import { useAdmissionStore } from '@/stores/admission.js'
import { fetchKlinika } from '@/api/klinika.js'

const router = useRouter()
const admission = useAdmissionStore()

// Schritt 1 muss abgeschlossen sein
if (!admission.patient.vorname) {
  router.replace({ name: 'aufnahme-1' })
}

const klinika = ref([])
onMounted(async () => {
  try { klinika.value = await fetchKlinika() } catch { klinika.value = [] }
})

const form = ref({
  status: admission.patient.status,
  klinikumId: admission.patient.klinikumId,
  etage: admission.patient.etage,
  abteilung: admission.patient.abteilung,
  station: admission.patient.station,
  zimmer: admission.patient.zimmer,
  bett: admission.patient.bett,
})

function back() {
  router.push({ name: 'aufnahme-1' })
}

function next() {
  admission.updatePatient({ ...form.value })
  router.push({ name: 'aufnahme-3' })
}
</script>

<template>
  <AppHeader title="Patient aufnehmen" :show-back="false" />
  <AdmissionStepper :current-step="2" />

  <main class="container">
    <h2 class="step-title">Aufenthalt &amp; Klinikum</h2>

    <form class="admission-form" @submit.prevent="next">
      <fieldset>
        <div class="grid">
          <label>
            <span>Status *</span>
            <select v-model="form.status" required>
              <option value="Stationär">Stationär</option>
              <option value="Ambulant">Ambulant</option>
            </select>
          </label>
          <label>
            <span>Klinikum *</span>
            <select v-model="form.klinikumId" required>
              <option :value="null">– bitte wählen –</option>
              <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
            </select>
          </label>
          <label>
            <span>Etage</span>
            <input v-model.trim="form.etage" type="text" placeholder="3. OG" />
          </label>
          <label>
            <span>Abteilung</span>
            <input v-model.trim="form.abteilung" type="text" placeholder="Kardiologie" />
          </label>
          <label>
            <span>Station</span>
            <input v-model.trim="form.station" type="text" placeholder="Station K3" />
          </label>
          <label>
            <span>Zimmer</span>
            <input v-model.trim="form.zimmer" type="text" placeholder="304" />
          </label>
          <label>
            <span>Bett</span>
            <input v-model.trim="form.bett" type="text" placeholder="Bett A" />
          </label>
        </div>
      </fieldset>

      <div class="btn-row">
        <button type="button" class="app-btn app-btn-secondary" @click="back">
          <i class="bi bi-arrow-left"></i> Zurück
        </button>
        <button type="submit" class="app-btn app-btn-primary">
          Weiter <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 42rem; margin: 0 auto; }
.step-title { font-size: 1.125rem; font-weight: 700; margin: 1rem 0 0.75rem; color: var(--color-text); }

.admission-form { display: flex; flex-direction: column; gap: 1rem; }

fieldset {
  border: 0;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.25rem 1.25rem;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0.875rem 1rem;
}

label { display: flex; flex-direction: column; gap: 0.25rem; }
label > span { font-size: 0.85rem; color: var(--color-muted); }

input, select {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem;
  color: var(--color-text);
  font-family: inherit;
  background: #fff;
}
input:focus, select:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }

.btn-row { display: flex; gap: 0.75rem; }

.app-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: var(--radius-card);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover { background: var(--color-primary-dark); }
.app-btn-secondary { background: var(--color-surface); color: var(--color-text); border: 0.0625rem solid var(--color-border); }
.app-btn-secondary:hover { background: var(--color-card); }
</style>
