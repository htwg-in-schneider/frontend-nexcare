<script setup>
import { ref, computed, watch } from 'vue'
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

const backendWaking = ref(false)
const backendError = ref(false)
const retryCount = ref(0)

async function loadWithRetry() {
  backendWaking.value = true
  backendError.value = false

  for (let attempt = 0; attempt < 30; attempt++) {
    retryCount.value = attempt
    try {
      await userStore.loadProfile()
      if (userStore.profile) {
        backendWaking.value = false
        return true
      }
    } catch {
      // ignore
    }
    await new Promise(r => setTimeout(r, 3000))
  }

  backendWaking.value = false
  backendError.value = true
  return false
}

watch(isAuthenticated, async (loggedIn) => {
  if (loggedIn) {
    await userStore.loadProfile()

    if (!userStore.profile) {
      const ok = await loadWithRetry()
      if (!ok) return
    }

    const publicRoutes = ['home', 'impressum', 'datenschutz', 'registrierung-info', null, undefined]
    if (publicRoutes.includes(route.name)) {
      router.push({ name: userStore.isPatient ? 'portal' : 'dashboard' })
    }
  } else {
    userStore.clear()
  }
}, { immediate: true })

const noNavRoutes = ['home', 'impressum', 'datenschutz', 'registrierung-info']
const showBottomNav = computed(() => !noNavRoutes.includes(route.name))
</script>

<template>
  <div v-if="isLoading" class="global-splash">
    <div class="splash-logo">NexCare</div>
    <div class="splash-spinner"></div>
  </div>

  <div v-else-if="backendWaking" class="global-splash">
    <div class="splash-logo">NexCare</div>
    <div class="splash-spinner"></div>
    <p class="splash-text">Server wird gestartet …</p>
    <p class="splash-sub">Das Backend wird aus dem Standby geholt. Dies kann bis zu 60 Sekunden dauern.</p>
  </div>

  <div v-else-if="backendError" class="global-splash">
    <div class="splash-logo">NexCare</div>
    <i class="bi bi-exclamation-triangle splash-icon"></i>
    <p class="splash-text">Server nicht erreichbar</p>
    <p class="splash-sub">Das Backend konnte nicht gestartet werden. Bitte versuche es später erneut.</p>
    <button class="splash-retry" @click="loadWithRetry()">Erneut versuchen</button>
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
  gap: 1rem;
  z-index: 9999;
  padding: 2rem;
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

.splash-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #1e293b);
  margin: 0;
}

.splash-sub {
  font-size: 0.85rem;
  color: var(--color-muted, #64748b);
  margin: 0;
  text-align: center;
  max-width: 20rem;
}

.splash-icon {
  font-size: 2.5rem;
  color: #f59e0b;
}

.splash-retry {
  margin-top: 0.5rem;
  padding: 0.6rem 1.4rem;
  background: var(--color-primary, #2563eb);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
}
.splash-retry:hover { opacity: 0.88; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
