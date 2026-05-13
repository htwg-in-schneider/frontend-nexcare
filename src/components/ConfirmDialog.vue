<script setup>
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui.js';

const ui = useUiStore();
const { dialog } = storeToRefs(ui);
</script>

<template>
  <Transition name="overlay">
    <div v-if="dialog" class="overlay" role="dialog" aria-modal="true">
      <div class="dialog">
        <h2 class="dialog-title">{{ dialog.title }}</h2>
        <p class="dialog-message">{{ dialog.message }}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-cancel" @click="ui.resolveDialog(false)">
            {{ dialog.cancelLabel }}
          </button>
          <button type="button" class="btn btn-confirm" @click="ui.resolveDialog(true)">
            {{ dialog.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 45, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 90;
}
.dialog {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.5rem 1.5rem 1.25rem;
  width: min(90vw, 24rem);
  box-shadow: 0 1rem 2.5rem rgba(15, 25, 45, 0.35);
}
.dialog-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}
.dialog-message {
  margin: 0 0 1.25rem;
  color: var(--color-text);
  font-size: 0.95rem;
  line-height: 1.4;
}
.dialog-actions {
  display: flex;
  gap: 0.625rem;
  justify-content: flex-end;
}
.btn {
  padding: 0.625rem 1rem;
  border: 0;
  border-radius: 0.625rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel {
  background: var(--color-bg);
  color: var(--color-text);
  border: 0.0625rem solid var(--color-border);
}
.btn-cancel:hover { background: #e9ebef; }
.btn-confirm {
  background: var(--color-primary);
  color: #fff;
}
.btn-confirm:hover { background: var(--color-primary-dark); }

.overlay-enter-active,
.overlay-leave-active { transition: opacity 0.15s ease; }
.overlay-enter-from,
.overlay-leave-to     { opacity: 0; }
</style>
