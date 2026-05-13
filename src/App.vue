<script setup>
import BottomNav from './components/BottomNav.vue';
import Toast from './components/Toast.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
</script>

<template>
  <router-view />
  <BottomNav active="patienten" />
  <Toast />
  <ConfirmDialog />
</template>

<style scoped></style>
