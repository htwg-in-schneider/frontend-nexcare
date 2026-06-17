<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import Toast from './components/Toast.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const route = useRoute()
// BottomNav nur in der App anzeigen, nicht auf Marketing-Seite und Impressum/Datenschutz
const noNavRoutes = ['home', 'impressum', 'datenschutz']
const showBottomNav = computed(() => !noNavRoutes.includes(route.name))
</script>

<template>
  <router-view />
  <BottomNav v-if="showBottomNav" />
  <Toast />
  <ConfirmDialog />
</template>

<style scoped></style>
