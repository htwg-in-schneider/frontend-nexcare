<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  submitLabel: { type: String, default: 'Speichern' },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const submitted = ref(false)
const TELEFON_RE = /^[+0-9\s() -]{1,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_RE = /^[\p{L} .'\-]+$/u
const PLZ_RE = /^\d{5}$/
const VNUMMER_RE = /^V-\d{4}-\d{3,6}$/

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
function updateNotfall(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    notfallkontakt: { ...props.modelValue.notfallkontakt, [field]: value }
  })
}

const errors = computed(() => {
  const e = {}
  const v = props.modelValue
  if (!v.vorname?.trim()) e.vorname = 'Vorname ist erforderlich'
  else if (v.vorname.length > 100) e.vorname = 'Maximal 100 Zeichen'
  else if (!NAME_RE.test(v.vorname)) e.vorname = 'Nur Buchstaben, Leerzeichen, Bindestriche, Punkte'

  if (!v.nachname?.trim()) e.nachname = 'Nachname ist erforderlich'
  else if (v.nachname.length > 100) e.nachname = 'Maximal 100 Zeichen'
  else if (!NAME_RE.test(v.nachname)) e.nachname = 'Nur Buchstaben, Leerzeichen, Bindestriche, Punkte'

  if (v.geburtsdatum) {
    const d = new Date(v.geburtsdatum)
    if (isNaN(d.getTime())) e.geburtsdatum = 'Ungültiges Datum'
    else if (d >= new Date()) e.geburtsdatum = 'Muss in der Vergangenheit liegen'
    else if (d.getFullYear() < 1900) e.geburtsdatum = 'Muss nach 1900 liegen'
  }

  if (!v.versicherungsnr?.trim()) e.versicherungsnr = 'Versicherungsnummer ist erforderlich'
  else if (!VNUMMER_RE.test(v.versicherungsnr)) e.versicherungsnr = 'Format: V-JJJJ-NNN (z.B. V-2024-001)'

  if (v.telefon && !TELEFON_RE.test(v.telefon))
    e.telefon = 'Nur Ziffern, +, Leerzeichen, Klammern, Bindestrich'

  if (v.email && !EMAIL_RE.test(v.email))
    e.email = 'Ungültige E-Mail-Adresse'

  if (v.strasse && v.strasse.length > 150)
    e.strasse = 'Maximal 150 Zeichen'

  if (v.plz && !PLZ_RE.test(v.plz))
    e.plz = 'PLZ muss genau 5 Ziffern haben'

  if (v.ort && v.ort.length > 100)
    e.ort = 'Maximal 100 Zeichen'

  const nk = v.notfallkontakt
  if (nk?.name && nk.name.length > 100) e.nkName = 'Maximal 100 Zeichen'
  else if (nk?.name && !NAME_RE.test(nk.name)) e.nkName = 'Nur Buchstaben, Leerzeichen, Bindestriche, Punkte'
  if (nk?.beziehung && nk.beziehung.length > 100) e.nkBeziehung = 'Maximal 100 Zeichen'
  if (nk?.telefon && !TELEFON_RE.test(nk.telefon))
    e.nkTelefon = 'Nur Ziffern, +, Leerzeichen, Klammern, Bindestrich'

  return e
})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function err(field) { return submitted.value ? errors.value[field] : null }

function onSubmit() {
  submitted.value = true
  if (hasErrors.value) return
  emit('submit')
}
</script>

<template>
  <form class="patient-form" @submit.prevent="onSubmit" novalidate>
    <fieldset>
      <legend>Persönliche Daten</legend>
      <div class="grid">
        <label>
          <span>Vorname<span class="req">*</span></span>
          <input type="text" placeholder="Maria" maxlength="100"
            :class="{ 'err': err('vorname') }"
            :value="modelValue.vorname"
            @input="update('vorname', $event.target.value)" />
          <span v-if="err('vorname')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('vorname') }}</span>
        </label>
        <label>
          <span>Nachname<span class="req">*</span></span>
          <input type="text" placeholder="Schmidt" maxlength="100"
            :class="{ 'err': err('nachname') }"
            :value="modelValue.nachname"
            @input="update('nachname', $event.target.value)" />
          <span v-if="err('nachname')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('nachname') }}</span>
        </label>
        <label>
          <span>Geburtsdatum</span>
          <input type="date" :max="new Date().toISOString().split('T')[0]" min="1900-01-01"
            :class="{ 'err': err('geburtsdatum') }"
            :value="modelValue.geburtsdatum"
            @input="update('geburtsdatum', $event.target.value)" />
          <span v-if="err('geburtsdatum')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('geburtsdatum') }}</span>
        </label>
        <label>
          <span>Versicherungsnr.</span>
          <input type="text" placeholder="V-2025-001" minlength="5" maxlength="30"
            :class="{ 'err': err('versicherungsnr') }"
            :value="modelValue.versicherungsnr"
            @input="update('versicherungsnr', $event.target.value)" />
          <span v-if="err('versicherungsnr')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('versicherungsnr') }}</span>
        </label>
        <label>
          <span>Telefon</span>
          <input type="tel" placeholder="+49 170 1234567" maxlength="20"
            :class="{ 'err': err('telefon') }"
            :value="modelValue.telefon"
            @input="update('telefon', $event.target.value)" />
          <span v-if="err('telefon')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('telefon') }}</span>
        </label>
        <label>
          <span>E-Mail</span>
          <input type="email" placeholder="patient@beispiel.de" maxlength="150"
            :class="{ 'err': err('email') }"
            :value="modelValue.email"
            @input="update('email', $event.target.value)" />
          <span v-if="err('email')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('email') }}</span>
        </label>
        <label class="wide">
          <span>Straße</span>
          <input type="text" placeholder="Musterstr. 12" maxlength="150"
            :class="{ 'err': err('strasse') }"
            :value="modelValue.strasse"
            @input="update('strasse', $event.target.value)" />
          <span v-if="err('strasse')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('strasse') }}</span>
        </label>
        <label>
          <span>PLZ</span>
          <input type="text" placeholder="78462" maxlength="5"
            :class="{ 'err': err('plz') }"
            :value="modelValue.plz"
            @input="update('plz', $event.target.value)" />
          <span v-if="err('plz')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('plz') }}</span>
        </label>
        <label>
          <span>Ort</span>
          <input type="text" placeholder="Konstanz" maxlength="100"
            :class="{ 'err': err('ort') }"
            :value="modelValue.ort"
            @input="update('ort', $event.target.value)" />
          <span v-if="err('ort')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('ort') }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Notfallkontakt</legend>
      <div class="grid">
        <label>
          <span>Name</span>
          <input type="text" placeholder="Hans Schmidt" maxlength="100"
            :class="{ 'err': err('nkName') }"
            :value="modelValue.notfallkontakt?.name"
            @input="updateNotfall('name', $event.target.value)" />
          <span v-if="err('nkName')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('nkName') }}</span>
        </label>
        <label>
          <span>Beziehung</span>
          <input type="text" placeholder="Ehepartner" maxlength="100"
            :class="{ 'err': err('nkBeziehung') }"
            :value="modelValue.notfallkontakt?.beziehung"
            @input="updateNotfall('beziehung', $event.target.value)" />
          <span v-if="err('nkBeziehung')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('nkBeziehung') }}</span>
        </label>
        <label class="wide">
          <span>Telefon</span>
          <input type="tel" placeholder="+49 170 7654321" maxlength="20"
            :class="{ 'err': err('nkTelefon') }"
            :value="modelValue.notfallkontakt?.telefon"
            @input="updateNotfall('telefon', $event.target.value)" />
          <span v-if="err('nkTelefon')" class="err-msg"><i class="bi bi-exclamation-circle"></i> {{ err('nkTelefon') }}</span>
        </label>
      </div>
    </fieldset>

    <div class="actions">
      <slot name="actions">
        <button type="submit" class="app-btn app-btn-primary">{{ submitLabel }}</button>
      </slot>
    </div>
  </form>
</template>

<style scoped>
.patient-form { display: flex; flex-direction: column; gap: 1rem; }
fieldset { border: 0; background: var(--color-card); border-radius: var(--radius-card); box-shadow: var(--shadow-card); padding: 1rem 1.25rem 1.25rem; margin: 0; }
legend { font-size: 1rem; font-weight: 700; color: var(--color-primary); padding: 0 0.25rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 0.875rem 1rem; margin-top: 0.5rem; }
label { display: flex; flex-direction: column; gap: 0.25rem; }
label.wide { grid-column: 1 / -1; }
label > span { font-size: 0.85rem; color: var(--color-muted); }
input, select { padding: 0.625rem 0.75rem; border: 0.0625rem solid var(--color-border); background: #fff; border-radius: 0.625rem; font-size: 0.95rem; color: var(--color-text); font-family: inherit; }
input:focus, select:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
input.err { border-color: #ef4444 !important; }
.err-msg { font-size: 0.78rem; color: #ef4444; display: flex; align-items: center; gap: 0.25rem; }
.req { color: #ef4444; margin-left: 0.15rem; }
.actions { display: flex; flex-direction: column; gap: 0.625rem; margin-top: 0.5rem; }
.app-btn { width: 100%; padding: 0.875rem 1.25rem; border: 0; border-radius: var(--radius-card); font-size: 1rem; font-weight: 600; cursor: pointer; }
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover { background: var(--color-primary-dark); }
.app-btn-danger { background: #b3372e; color: #fff; }
.app-btn-danger:hover { background: #8c2c25; }
</style>
