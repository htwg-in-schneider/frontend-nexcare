<script setup>
defineProps({
  currentStep: { type: Number, required: true }, // 1, 2 oder 3
})

const steps = [
  { label: 'Persönliche Daten' },
  { label: 'Notfallkontakt' },
]
</script>

<template>
  <div class="stepper" aria-label="Aufnahmeschritte">
    <div
      v-for="(step, i) in steps"
      :key="i"
      class="step"
      :class="{ active: i + 1 === currentStep, done: i + 1 < currentStep }"
    >
      <div class="step-circle">
        <i v-if="i + 1 < currentStep" class="bi bi-check-lg"></i>
        <span v-else>{{ i + 1 }}</span>
      </div>
      <span class="step-label">{{ step.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 1rem 1rem 0;
  max-width: 42rem;
  margin: 0 auto;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  position: relative;
}

/* Verbindungslinie zwischen Schritten */
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1rem;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--color-border);
  z-index: 0;
}
.step.done:not(:last-child)::after { background: var(--color-primary); }

.step-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-muted);
  position: relative;
  z-index: 1;
}
.step.active .step-circle {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}
.step.done .step-circle {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.step-label {
  font-size: 0.7rem;
  color: var(--color-muted);
  text-align: center;
  line-height: 1.2;
}
.step.active .step-label { color: var(--color-primary); font-weight: 600; }
.step.done .step-label { color: var(--color-primary); }
</style>
