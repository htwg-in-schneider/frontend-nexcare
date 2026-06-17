<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import BottomNav from './components/BottomNav.vue'
import Toast from './components/Toast.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { setTokenGetter } from '@/api/auth.js'
import { useUserStore } from '@/stores/user.js'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, getAccessTokenSilently } = useAuth0()
const userStore = useUserStore()

// Provide token getter to API layer
setTokenGetter(getAccessTokenSilently)

// Load backend profile whenever auth state changes; redirect to patients after login
watch(isAuthenticated, async (loggedIn) => {
  if (loggedIn) {
    await userStore.loadProfile()
    if (route.name === 'home') {
      router.push({ name: 'patient-list' })
    }
  } else {
    userStore.clear()
  }
}, { immediate: true })

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
