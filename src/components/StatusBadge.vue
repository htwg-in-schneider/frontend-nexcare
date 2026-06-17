<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
});

const variantClass = computed(() =>
  props.status === 'Stationär' ? 'status-stationaer' : 'status-ambulant'
);
</script>

<template>
  <span class="status-badge" :class="variantClass">{{ status }}</span>
</template>

<style scoped>
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
}
.status-stationaer {
  background: var(--color-stationaer-bg);
  color: var(--color-stationaer-text);
}
.status-ambulant {
  background: var(--color-ambulant-bg);
  color: var(--color-ambulant-text);
}
</style>
