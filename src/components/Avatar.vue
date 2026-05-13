<script setup>
defineProps({
  initials: { type: String, required: true },
});
</script>

<template>
  <div class="avatar">{{ initials }}</div>
</template>

<style scoped>
.avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--color-avatar-bg);
  color: var(--color-avatar-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}
</style>
