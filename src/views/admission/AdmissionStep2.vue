<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import AppHeader from '@/components/AppHeader.vue'
import AdmissionStepper from '@/components/AdmissionStepper.vue'
import { useAdmissionStore } from '@/stores/admission.js'
import { patientStep2Schema } from '@/validation/schemas.js'
import { fetchKlinika } from '@/api/klinika.js'

const router = useRouter()
const admission = useAdmissionStore()

if (!admission.patient.vorname) {
  router.replace({ name: 'aufnahme-1' })
}

const klinika = ref([])
onMounted(async () => {
  try { klinika.value = await fetchKlinika() } catch { klinika.value = [] }
})

const { handleSubmit } = useForm({
  validationSchema: patientStep2Schema,
  initialValues: {
    status:     admission.patient.status     ?? 'Stationär',
    klinikumId: admission.patient.klinikumId ?? '',
    etage:      admission.patient.etage      ?? '',
    abteilung:  admission.patient.abteilung  ?? '',
    station:    admission.patient.station    ?? '',
    zimmer:     admission.patient.zimmer     ?? '',
    bett:       admission.patient.bett       ?? '',
  },
})

const status     = useField('status')
const klinikumId = useField('klinikumId')
const etage      = useField('etage')
const abteilung  = useField('abteilung')
const station    = useField('station')
const zimmer     = useField('zimmer')
const bett       = useField('bett')

const canProceed = computed(() =>
  status.value.value &&
  klinikumId.value.value !== '' && klinikumId.value.value != null
)

function back() { router.push({ name: 'aufnahme-1' }) }

const onSubmit = handleSubmit(values => {
  admission.updatePatient({ ...values })
  router.push({ name: 'aufnahme-3' })
})
</script>

<template>
  <AppHeader title="Patient aufnehmen" :show-back="false" />
  <AdmissionStepper :current-step="2" />

  <main class="container">
    <h2 class="step-title">Aufenthalt &amp; Klinikum</h2>

    <form class="admission-form" @submit.prevent="onSubmit" novalidate>
      <fieldset>
        <div class="grid">

          <label>
            <span>Status<span class="required-mark">*</span></span>
            <select
              v-model="status.value.value"
              title="Aufnahmestatus (Pflichtfeld)"
              :class="{ 'input-error': status.errorMessage.value }"
            >
              <option value="Stationär">Stationär</option>
              <option value="Ambulant">Ambulant</option>
            </select>
            <span v-if="status.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ status.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Klinikum<span class="required-mark">*</span></span>
            <select
              v-model="klinikumId.value.value"
              title="Klinikum auswählen (Pflichtfeld)"
              :class="{ 'input-error': klinikumId.errorMessage.value }"
            >
              <option value="">– bitte wählen –</option>
              <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
            </select>
            <span v-if="klinikumId.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ klinikumId.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Etage</span>
            <input
              v-model="etage.value.value"
              type="text"
              title="Etage (optional)"
              placeholder="3. OG"
              maxlength="50"
            />
          </label>

          <label>
            <span>Abteilung</span>
            <input
              v-model="abteilung.value.value"
              type="text"
              title="Abteilung (optional)"
              placeholder="Kardiologie"
              maxlength="100"
            />
          </label>

          <label>
            <span>Station</span>
            <input
              v-model="station.value.value"
              type="text"
              title="Station (optional)"
              placeholder="Station K3"
              maxlength="100"
            />
          </label>

          <label>
            <span>Zimmer</span>
            <input
              v-model="zimmer.value.value"
              type="text"
              title="Zimmernummer (optional)"
              placeholder="304"
              maxlength="20"
            />
          </label>

          <label>
            <span>Bett</span>
            <input
              v-model="bett.value.value"
              type="text"
              title="Bettbezeichnung (optional)"
              placeholder="Bett A"
              maxlength="20"
            />
          </label>

        </div>
      </fieldset>

      <div class="btn-row">
        <button type="button" class="app-btn app-btn-secondary" @click="back">
          <i class="bi bi-arrow-left"></i> Zurück
        </button>
        <button type="submit" class="app-btn app-btn-primary" :disabled="!canProceed">
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
fieldset { border: 0; background: var(--color-card); border-radius: var(--radius-card); box-shadow: var(--shadow-card); padding: 1rem 1.25rem 1.25rem; margin: 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 0.875rem 1rem; }
label { display: flex; flex-direction: column; gap: 0.25rem; }
label > span { font-size: 0.85rem; color: var(--color-muted); font-weight: 500; }
input, select { padding: 0.625rem 0.75rem; border: 0.0625rem solid var(--color-border); border-radius: 0.625rem; font-size: 0.95rem; color: var(--color-text); font-family: inherit; background: #fff; }
input:focus, select:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.btn-row { display: flex; gap: 0.75rem; }
.app-btn { flex: 1; padding: 0.875rem 1.25rem; border: 0; border-radius: var(--radius-card); font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.app-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.app-btn-secondary { background: var(--color-surface); color: var(--color-text); border: 0.0625rem solid var(--color-border); }
.app-btn-secondary:hover { background: var(--color-card); }
.input-error { border-color: #ef4444 !important; }
.field-error-msg { font-size: 0.78rem; color: #ef4444; display: flex; align-items: center; gap: 0.25rem; }
.required-mark { color: #ef4444; margin-left: 0.15rem; }
</style>
