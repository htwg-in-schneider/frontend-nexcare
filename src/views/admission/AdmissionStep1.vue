<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import AppHeader from '@/components/AppHeader.vue'
import AdmissionStepper from '@/components/AdmissionStepper.vue'
import { useAdmissionStore } from '@/stores/admission.js'
import { patientStep1Schema } from '@/validation/schemas.js'
import { fetchKlinika } from '@/api/klinika.js'

const router = useRouter()
const admission = useAdmissionStore()
const klinika = ref([])

onMounted(async () => {
  try { klinika.value = await fetchKlinika() } catch { klinika.value = [] }
})

const { handleSubmit, meta } = useForm({
  validationSchema: patientStep1Schema,
  initialValues: {
    vorname:        admission.patient.vorname        ?? '',
    nachname:       admission.patient.nachname       ?? '',
    geburtsdatum:   admission.patient.geburtsdatum   ?? '',
    versicherungsnr:admission.patient.versicherungsnr?? '',
    telefon:        admission.patient.telefon        ?? '',
    email:          admission.patient.email          ?? '',
    strasse:        admission.patient.strasse        ?? '',
    plz:            admission.patient.plz            ?? '',
    ort:            admission.patient.ort            ?? '',
    status:         admission.patient.status         ?? 'Stationär',
    klinikumId:     admission.patient.klinikumId     ?? '',
  },
})

const vorname        = useField('vorname')
const nachname       = useField('nachname')
const geburtsdatum   = useField('geburtsdatum')
const versicherungsnr= useField('versicherungsnr')
const telefon        = useField('telefon')
const email          = useField('email')
const strasse        = useField('strasse')
const plz            = useField('plz')
const ort            = useField('ort')
const status         = useField('status')
const klinikumId     = useField('klinikumId')

const onSubmit = handleSubmit(values => {
  admission.updatePatient({ ...values })
  router.push({ name: 'aufnahme-3' })
})
</script>

<template>
  <AppHeader title="Patient aufnehmen" :show-back="true" back-route="/patients" />
  <AdmissionStepper :current-step="1" />

  <main class="container">
    <h2 class="step-title">Persönliche Daten</h2>

    <form class="admission-form" @submit.prevent="onSubmit" novalidate>
      <fieldset>
        <div class="grid">

          <label>
            <span>Vorname<span class="required-mark">*</span></span>
            <input
              v-model="vorname.value.value"
              type="text"
              title="Vorname des Patienten (Pflichtfeld, maximal 100 Zeichen)"
              placeholder="Maria"
              maxlength="100"
              autocomplete="given-name"
              :class="{ 'input-error': vorname.errorMessage.value }"
            />
            <span v-if="vorname.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ vorname.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Nachname<span class="required-mark">*</span></span>
            <input
              v-model="nachname.value.value"
              type="text"
              title="Nachname des Patienten (Pflichtfeld, maximal 100 Zeichen)"
              placeholder="Schmidt"
              maxlength="100"
              autocomplete="family-name"
              :class="{ 'input-error': nachname.errorMessage.value }"
            />
            <span v-if="nachname.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ nachname.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Geburtsdatum<span class="required-mark">*</span></span>
            <input
              v-model="geburtsdatum.value.value"
              type="date"
              title="Geburtsdatum (Pflichtfeld, muss in der Vergangenheit liegen)"
              :max="new Date().toISOString().split('T')[0]"
              :class="{ 'input-error': geburtsdatum.errorMessage.value }"
            />
            <span v-if="geburtsdatum.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ geburtsdatum.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Versicherungsnr.<span class="required-mark">*</span></span>
            <input
              v-model="versicherungsnr.value.value"
              type="text"
              title="Versicherungsnummer (Pflichtfeld, 5–30 Zeichen)"
              placeholder="V-2025-001"
              minlength="5"
              maxlength="30"
              :class="{ 'input-error': versicherungsnr.errorMessage.value }"
            />
            <span v-if="versicherungsnr.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ versicherungsnr.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Telefon</span>
            <input
              v-model="telefon.value.value"
              type="tel"
              title="Telefonnummer (optional) – nur Ziffern, +, Leerzeichen, Klammern, Bindestrich; maximal 20 Zeichen"
              placeholder="+49 170 1234567"
              maxlength="20"
              :class="{ 'input-error': telefon.errorMessage.value }"
            />
            <span v-if="telefon.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ telefon.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>E-Mail</span>
            <input
              v-model="email.value.value"
              type="email"
              title="E-Mail-Adresse (optional) – Format: name@beispiel.de"
              placeholder="patient@beispiel.de"
              maxlength="150"
              autocomplete="email"
              :class="{ 'input-error': email.errorMessage.value }"
            />
            <span v-if="email.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ email.errorMessage.value }}
            </span>
          </label>

          <label class="wide">
            <span>Straße</span>
            <input
              v-model="strasse.value.value"
              type="text"
              title="Straße und Hausnummer (optional, maximal 150 Zeichen)"
              placeholder="Musterstr. 12"
              maxlength="150"
              autocomplete="street-address"
              :class="{ 'input-error': strasse.errorMessage.value }"
            />
            <span v-if="strasse.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ strasse.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>PLZ</span>
            <input
              v-model="plz.value.value"
              type="text"
              title="Postleitzahl (optional, genau 5 Ziffern)"
              placeholder="78462"
              maxlength="5"
              autocomplete="postal-code"
              :class="{ 'input-error': plz.errorMessage.value }"
            />
            <span v-if="plz.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ plz.errorMessage.value }}
            </span>
          </label>

          <label>
            <span>Ort</span>
            <input
              v-model="ort.value.value"
              type="text"
              title="Ort (optional, maximal 100 Zeichen)"
              placeholder="Konstanz"
              maxlength="100"
              autocomplete="address-level2"
              :class="{ 'input-error': ort.errorMessage.value }"
            />
            <span v-if="ort.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ ort.errorMessage.value }}
            </span>
          </label>

        </div>
      </fieldset>

      <fieldset>
        <legend>Aufnahme</legend>
        <div class="grid">
          <label>
            <span>Status<span class="required-mark">*</span></span>
            <select v-model="status.value.value" :class="{ 'input-error': status.errorMessage.value }">
              <option value="Stationär">Stationär</option>
              <option value="Ambulant">Ambulant</option>
            </select>
            <span v-if="status.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ status.errorMessage.value }}
            </span>
          </label>
          <label>
            <span>Klinikum<span class="required-mark">*</span></span>
            <select v-model="klinikumId.value.value" :class="{ 'input-error': klinikumId.errorMessage.value }">
              <option value="">– bitte wählen –</option>
              <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
            </select>
            <span v-if="klinikumId.errorMessage.value" class="field-error-msg">
              <i class="bi bi-exclamation-circle"></i> {{ klinikumId.errorMessage.value }}
            </span>
          </label>
        </div>
      </fieldset>

      <button type="submit" class="app-btn app-btn-primary" :disabled="!meta.valid">
        Weiter <i class="bi bi-arrow-right"></i>
      </button>
    </form>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 42rem; margin: 0 auto; }
.step-title { font-size: 1.125rem; font-weight: 700; margin: 1rem 0 0.75rem; color: var(--color-text); }
.admission-form { display: flex; flex-direction: column; gap: 1rem; }
fieldset { border: 0; background: var(--color-card); border-radius: var(--radius-card); box-shadow: var(--shadow-card); padding: 1rem 1.25rem 1.25rem; margin: 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 0.875rem 1rem; }
.wide { grid-column: 1 / -1; }
label { display: flex; flex-direction: column; gap: 0.25rem; }
label > span { font-size: 0.85rem; color: var(--color-muted); font-weight: 500; }
input {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.95rem; color: var(--color-text); font-family: inherit; background: #fff;
}
input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.app-btn { width: 100%; padding: 0.875rem 1.25rem; border: 0; border-radius: var(--radius-card); font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.app-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.input-error { border-color: #ef4444 !important; }
.field-error-msg { font-size: 0.78rem; color: #ef4444; display: flex; align-items: center; gap: 0.25rem; }
.required-mark { color: #ef4444; margin-left: 0.15rem; }
</style>
