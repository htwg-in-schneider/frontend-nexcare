<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Suchen...' },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="search-wrapper">
    <i class="bi bi-search"></i>
    <input
      type="text"
      class="search-input"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped></style>
