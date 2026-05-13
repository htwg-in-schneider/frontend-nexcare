<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, // 'primary' | 'secondary'
});
</script>

<template>
  <button :type="type" class="app-btn" :class="`app-btn-${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: var(--radius-card);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.app-btn-primary {
  background: var(--color-primary);
  color: #fff;
}
.app-btn-primary:hover {
  background: var(--color-primary-dark);
}
.app-btn-secondary {
  background: #fff;
  color: var(--color-primary);
  border: 0.0625rem solid var(--color-border);
}
.app-btn-secondary:hover {
  background: var(--color-bg);
}
</style>
