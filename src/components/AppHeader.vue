<script setup>
defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: true },
});

defineEmits(['back']);
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <button
        v-if="showBack"
        class="back-btn"
        aria-label="Zurück"
        @click="$emit('back')"
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
