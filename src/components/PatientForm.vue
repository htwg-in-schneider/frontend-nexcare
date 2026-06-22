<script setup>
defineProps({
  modelValue: { type: Object, required: true },
  submitLabel: { type: String, default: 'Speichern' },
});

defineEmits(['update:modelValue', 'submit']);
</script>

<template>
  <form class="patient-form" @submit.prevent="$emit('submit')" novalidate>
    <fieldset>
      <legend>Persönliche Daten</legend>
      <div class="grid">
        <label>
          <span>Vorname<span class="required-mark">*</span></span>
          <input type="text" required
            title="Vorname (Pflichtfeld, maximal 100 Zeichen)"
            placeholder="Maria"
            maxlength="100"
            :value="modelValue.vorname"
            @input="$emit('update:modelValue', { ...modelValue, vorname: $event.target.value })" />
        </label>
        <label>
          <span>Nachname<span class="required-mark">*</span></span>
          <input type="text" required
            title="Nachname (Pflichtfeld, maximal 100 Zeichen)"
            placeholder="Schmidt"
            maxlength="100"
            :value="modelValue.nachname"
            @input="$emit('update:modelValue', { ...modelValue, nachname: $event.target.value })" />
        </label>
        <label>
          <span>Geburtsdatum</span>
          <input type="date"
            title="Geburtsdatum – muss in der Vergangenheit liegen"
            :max="new Date().toISOString().split('T')[0]"
            :value="modelValue.geburtsdatum"
            @input="$emit('update:modelValue', { ...modelValue, geburtsdatum: $event.target.value })" />
        </label>
        <label>
          <span>Versicherungsnr.</span>
          <input type="text"
            title="Krankenversicherungsnummer (5–30 Zeichen)"
            placeholder="V-2025-001"
            minlength="5"
            maxlength="30"
            :value="modelValue.versicherungsnr"
            @input="$emit('update:modelValue', { ...modelValue, versicherungsnr: $event.target.value })" />
        </label>
        <label>
          <span>Telefon</span>
          <input type="tel"
            title="Telefonnummer (optional) – nur Ziffern, +, Leerzeichen, Klammern, Bindestrich"
            placeholder="+49 170 1234567"
            pattern="^[+0-9\s() -]{0,20}$"
            maxlength="20"
            :value="modelValue.telefon"
            @input="$emit('update:modelValue', { ...modelValue, telefon: $event.target.value })" />
        </label>
        <label>
          <span>E-Mail</span>
          <input type="email"
            title="E-Mail-Adresse (optional) – Format: name@beispiel.de"
            placeholder="patient@beispiel.de"
            maxlength="150"
            :value="modelValue.email"
            @input="$emit('update:modelValue', { ...modelValue, email: $event.target.value })" />
        </label>
        <label class="wide">
          <span>Adresse</span>
          <input type="text"
            title="Wohnanschrift (optional, maximal 250 Zeichen)"
            placeholder="Musterstr. 12, 78462 Konstanz"
            maxlength="250"
            :value="modelValue.adresse"
            @input="$emit('update:modelValue', { ...modelValue, adresse: $event.target.value })" />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Notfallkontakt</legend>
      <div class="grid">
        <label>
          <span>Name</span>
          <input type="text" title="Name des Notfallkontakts (optional, maximal 100 Zeichen)" placeholder="Hans Schmidt" maxlength="100"
            :value="modelValue.notfallkontakt?.name"
            @input="$emit('update:modelValue', { ...modelValue, notfallkontakt: { ...modelValue.notfallkontakt, name: $event.target.value } })" />
        </label>
        <label>
          <span>Beziehung</span>
          <input type="text" title="Beziehung zum Patienten (optional, maximal 100 Zeichen)" placeholder="Ehepartner" maxlength="100"
            :value="modelValue.notfallkontakt?.beziehung"
            @input="$emit('update:modelValue', { ...modelValue, notfallkontakt: { ...modelValue.notfallkontakt, beziehung: $event.target.value } })" />
        </label>
        <label class="wide">
          <span>Telefon</span>
          <input type="tel" title="Telefon des Notfallkontakts (optional)" placeholder="+49 170 7654321"
            pattern="^[+0-9\s() -]{0,20}$" maxlength="20"
            :value="modelValue.notfallkontakt?.telefon"
            @input="$emit('update:modelValue', { ...modelValue, notfallkontakt: { ...modelValue.notfallkontakt, telefon: $event.target.value } })" />
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
input:invalid:not(:placeholder-shown) { border-color: #dc2626; }
.actions { display: flex; flex-direction: column; gap: 0.625rem; margin-top: 0.5rem; }
.app-btn { width: 100%; padding: 0.875rem 1.25rem; border: 0; border-radius: var(--radius-card); font-size: 1rem; font-weight: 600; cursor: pointer; }
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover { background: var(--color-primary-dark); }
.app-btn-danger { background: #b3372e; color: #fff; }
.app-btn-danger:hover { background: #8c2c25; }
</style>
