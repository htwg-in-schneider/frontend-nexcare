<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BottomNav from './components/BottomNav.vue';
import Toast from './components/Toast.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';

const route = useRoute();
const publicRoutes = ['home', 'impressum', 'datenschutz'];
const showBottomNav = computed(() => !publicRoutes.includes(route.name));
</script>

<template>
  <router-view />
  <BottomNav v-if="showBottomNav" active="patienten" />
  <Toast />
  <ConfirmDialog />
</template>

<style scoped></style>
