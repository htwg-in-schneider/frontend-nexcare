<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { fetchKlinika } from '@/api/klinika.js';
import { useFilterStore } from '@/stores/filter.js';

const filterStore = useFilterStore();
const { statusFilter, klinikumFilter } = storeToRefs(filterStore);

const klinika = ref([]);

onMounted(async () => {
  try {
    klinika.value = await fetchKlinika();
  } catch {
    klinika.value = [];
  }
});

function clear() {
  filterStore.reset();
}
</script>

<template>
  <div class="patient-filter">
    <label class="filter-field">
      <span class="filter-label">Status</span>
      <select v-model="statusFilter">
        <option value="">Alle</option>
        <option value="Stationär">Stationär</option>
        <option value="Ambulant">Ambulant</option>
      </select>
    </label>

    <label class="filter-field">
      <span class="filter-label">Klinikum</span>
      <select v-model="klinikumFilter">
        <option value="">Alle Klinika</option>
        <option v-for="k in klinika" :key="k.id" :value="String(k.id)">{{ k.name }}</option>
      </select>
    </label>

    <button class="clear-btn" type="button" @click="clear" aria-label="Filter zurücksetzen">
      <i class="bi bi-arrow-counterclockwise"></i>
    </button>
  </div>
</template>

<style scoped>
.patient-filter {
  display: flex;
  gap: 0.625rem;
  align-items: end;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 9rem;
  min-width: 8rem;
}
.filter-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-weight: 500;
}
select {
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  background: #fff;
  border-radius: 0.625rem;
  font-size: 0.95rem;
  color: var(--color-text);
  font-family: inherit;
}
select:focus {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: -0.0625rem;
}
.clear-btn {
  background: #fff;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  padding: 0.625rem 0.75rem;
  font-size: 1rem;
  color: var(--color-muted);
  cursor: pointer;
}
.clear-btn:hover { color: var(--color-text); background: var(--color-bg); }
</style>
