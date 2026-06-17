<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<template>
  <a href="#" class="nav-item" :class="{ active }" @click.prevent="$emit('click')">
    <i class="bi" :class="icon"></i>
    <span>{{ label }}</span>
  </a>
</template>

<style scoped>
.nav-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  background: none;
  border: 0;
  color: var(--color-muted);
  font-size: 0.7rem;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  text-decoration: none;
  min-width: 3.25rem;
}
.nav-item i { font-size: 1.25rem; }
.nav-item.active {
  color: var(--color-primary);
  font-weight: 600;
}

@media (min-width: 62em) {
  .nav-item {
    flex-direction: row;
    gap: 0.5rem;
    font-size: 0.9rem;
    padding: 0.875rem 0.5rem;
  }
  .nav-item i { font-size: 1.1rem; }
}
</style>
