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
const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
const userStore = useUserStore()

setTokenGetter(getAccessTokenSilently)

watch(isAuthenticated, async (loggedIn) => {
  if (loggedIn) {
    await userStore.loadProfile()
    const publicRoutes = ['home', 'impressum', 'datenschutz', null, undefined]
    if (publicRoutes.includes(route.name)) {
      // Rollenbasierter Redirect: Patienten → /portal, Staff → /dashboard
      router.push({ name: userStore.isPatient ? 'portal' : 'dashboard' })
    }
  } else {
    userStore.clear()
  }
}, { immediate: true })

const noNavRoutes = ['home', 'impressum', 'datenschutz']
const showBottomNav = computed(() => !noNavRoutes.includes(route.name))
</script>

<template>
  <div v-if="isLoading" class="global-splash">
    <div class="splash-logo">NexCare</div>
    <div class="splash-spinner"></div>
  </div>
  <template v-else>
    <router-view />
    <BottomNav v-if="showBottomNav" />
    <Toast />
    <ConfirmDialog />
  </template>
</template>

<style scoped>
.global-splash {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #fff);
  gap: 1.5rem;
  z-index: 9999;
}

.splash-logo {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary, #2563eb);
  letter-spacing: -0.5px;
}

.splash-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border, #e2e8f0);
  border-top-color: var(--color-primary, #2563eb);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
