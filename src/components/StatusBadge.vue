<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
});

const LABELS = {
  'Stationär':  'Stationär',
  'STATIONAER': 'Stationär',
  'Ambulant':   'Ambulant',
  'AMBULANT':   'Ambulant',
  'Beantragt':  'Beantragt',
  'BEANTRAGT':  'Beantragt',
  'Entlassen':  'Entlassen',
  'ENTLASSEN':  'Entlassen',
}

const VARIANTS = {
  'Stationär':  'status-stationaer',
  'STATIONAER': 'status-stationaer',
  'Ambulant':   'status-ambulant',
  'AMBULANT':   'status-ambulant',
  'Beantragt':  'status-beantragt',
  'BEANTRAGT':  'status-beantragt',
  'Entlassen':  'status-entlassen',
  'ENTLASSEN':  'status-entlassen',
}

const label = computed(() => LABELS[props.status] ?? props.status)
const variantClass = computed(() => VARIANTS[props.status] ?? 'status-ambulant')
</script>

<template>
  <span class="status-badge" :class="variantClass">{{ label }}</span>
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
.status-beantragt {
  background: #fef9c3;
  color: #854d0e;
}
.status-entlassen {
  background: #f1f5f9;
  color: #64748b;
}
</style>
