<script setup>
import { ref, onMounted } from 'vue';
import { fetchKlinika } from '@/api/klinika.js';

defineProps({
  modelValue: { type: Object, required: true },
  submitLabel: { type: String, default: 'Speichern' },
});

defineEmits(['update:modelValue', 'submit']);

const klinika = ref([]);

onMounted(async () => {
  try {
    klinika.value = await fetchKlinika();
  } catch {
    klinika.value = [];
  }
});
</script>

<template>
  <form class="patient-form" @submit.prevent="$emit('submit')">
    <fieldset>
      <legend>Persönliche Daten</legend>
      <div class="grid">
        <label>
          <span>Vorname</span>
          <input type="text" required :value="modelValue.vorname"
            @input="$emit('update:modelValue', { ...modelValue, vorname: $event.target.value })" />
        </label>
        <label>
          <span>Nachname</span>
          <input type="text" required :value="modelValue.nachname"
            @input="$emit('update:modelValue', { ...modelValue, nachname: $event.target.value })" />
        </label>
        <label>
          <span>Geburtsdatum</span>
          <input type="date" :value="modelValue.geburtsdatum"
            @input="$emit('update:modelValue', { ...modelValue, geburtsdatum: $event.target.value })" />
        </label>
        <label>
          <span>Versicherungsnr.</span>
          <input type="text" :value="modelValue.versicherungsnr"
            @input="$emit('update:modelValue', { ...modelValue, versicherungsnr: $event.target.value })" />
        </label>
        <label>
          <span>Telefon</span>
          <input type="tel" :value="modelValue.telefon"
            @input="$emit('update:modelValue', { ...modelValue, telefon: $event.target.value })" />
        </label>
        <label>
          <span>E-Mail</span>
          <input type="email" :value="modelValue.email"
            @input="$emit('update:modelValue', { ...modelValue, email: $event.target.value })" />
        </label>
        <label class="wide">
          <span>Adresse</span>
          <input type="text" :value="modelValue.adresse"
            @input="$emit('update:modelValue', { ...modelValue, adresse: $event.target.value })" />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Aktueller Aufenthalt</legend>
      <div class="grid">
        <label>
          <span>Status</span>
          <select :value="modelValue.status"
            @change="$emit('update:modelValue', { ...modelValue, status: $event.target.value })">
            <option value="Stationär">Stationär</option>
            <option value="Ambulant">Ambulant</option>
          </select>
        </label>
        <label>
          <span>Klinikum</span>
          <select :value="modelValue.klinikumId ?? ''"
            @change="$emit('update:modelValue', { ...modelValue, klinikumId: $event.target.value ? Number($event.target.value) : null })">
            <option value="">– bitte wählen –</option>
            <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
          </select>
        </label>
        <label>
          <span>Etage</span>
          <input type="text" :value="modelValue.etage"
            @input="$emit('update:modelValue', { ...modelValue, etage: $event.target.value })" />
        </label>
        <label>
          <span>Abteilung</span>
          <input type="text" :value="modelValue.abteilung"
            @input="$emit('update:modelValue', { ...modelValue, abteilung: $event.target.value })" />
        </label>
        <label>
          <span>Station</span>
          <input type="text" :value="modelValue.station"
            @input="$emit('update:modelValue', { ...modelValue, station: $event.target.value })" />
        </label>
        <label>
          <span>Zimmer</span>
          <input type="text" :value="modelValue.zimmer"
            @input="$emit('update:modelValue', { ...modelValue, zimmer: $event.target.value })" />
        </label>
        <label>
          <span>Bett</span>
          <input type="text" :value="modelValue.bett"
            @input="$emit('update:modelValue', { ...modelValue, bett: $event.target.value })" />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Notfallkontakt</legend>
      <div class="grid">
        <label>
          <span>Name</span>
          <input type="text" :value="modelValue.notfallkontakt.name"
            @input="$emit('update:modelValue', { ...modelValue, notfallkontakt: { ...modelValue.notfallkontakt, name: $event.target.value } })" />
        </label>
        <label>
          <span>Beziehung</span>
          <input type="text" :value="modelValue.notfallkontakt.beziehung"
            @input="$emit('update:modelValue', { ...modelValue, notfallkontakt: { ...modelValue.notfallkontakt, beziehung: $event.target.value } })" />
        </label>
        <label class="wide">
          <span>Telefon</span>
          <input type="tel" :value="modelValue.notfallkontakt.telefon"
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
.patient-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
fieldset {
  border: 0;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.25rem 1.25rem;
  margin: 0;
}
legend {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
  padding: 0 0.25rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0.875rem 1rem;
  margin-top: 0.5rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
label.wide { grid-column: 1 / -1; }
label > span {
  font-size: 0.85rem;
  color: var(--color-muted);
}
input, select {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  background: #fff;
  border-radius: 0.625rem;
  font-size: 0.95rem;
  color: var(--color-text);
  font-family: inherit;
}
input:focus, select:focus {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: -0.0625rem;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 0.5rem;
}
.app-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: var(--radius-card);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.app-btn-primary { background: var(--color-primary); color: #fff; }
.app-btn-primary:hover { background: var(--color-primary-dark); }
.app-btn-danger { background: #b3372e; color: #fff; }
.app-btn-danger:hover { background: #8c2c25; }
</style>
