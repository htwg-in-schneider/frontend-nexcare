<script setup>
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui.js';

const ui = useUiStore();
const { toast } = storeToRefs(ui);
</script>

<template>
  <Transition name="toast">
    <div v-if="toast" class="toast" :class="`toast-${toast.variant}`" role="status" aria-live="polite">
      <i class="bi" :class="iconFor(toast.variant)"></i>
      <span>{{ toast.message }}</span>
    </div>
  </Transition>
</template>

<script>
function iconFor(variant) {
  if (variant === 'error') return 'bi-exclamation-triangle-fill';
  if (variant === 'info') return 'bi-info-circle-fill';
  return 'bi-check-circle-fill';
}
export default { methods: { iconFor } };
</script>

<style scoped>
.toast {
  position: fixed;
  top: 14.2857%; /* 1/7 vom oberen Rand */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.25rem;
  background: var(--color-card);
  color: var(--color-text);
  border-radius: var(--radius-card);
  box-shadow: 0 0.5rem 1.5rem rgba(20, 30, 60, 0.18);
  font-size: 0.95rem;
  font-weight: 500;
  max-width: min(90vw, 28rem);
  z-index: 100;
}
.toast i { font-size: 1.15rem; flex-shrink: 0; }
.toast-success { border-left: 0.25rem solid #2d6a3a; }
.toast-success i { color: #2d6a3a; }
.toast-error   { border-left: 0.25rem solid #b3372e; }
.toast-error i { color: #b3372e; }
.toast-info    { border-left: 0.25rem solid var(--color-primary); }
.toast-info i  { color: var(--color-primary); }

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -0.5rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -0.5rem);
}
</style>
