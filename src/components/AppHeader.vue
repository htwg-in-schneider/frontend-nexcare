<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: true },
  backRoute: { type: String, default: null }, // optionaler Router-Pfad für den Zurück-Button
})

const emit = defineEmits(['back'])
const router = useRouter()

function handleBack() {
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    emit('back')
  }
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <button
        v-if="showBack"
        class="back-btn"
        aria-label="Zurück"
        @click="handleBack"
      >
        <i class="bi bi-arrow-left"></i>
      </button>
      <span v-else></span>
      <h1 class="header-title">{{ title }}</h1>
      <span></span>
    </div>
  </header>
</template>

<style scoped></style>
