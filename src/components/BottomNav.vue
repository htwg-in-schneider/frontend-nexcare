<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '@/stores/user.js'
import BottomNavItem from './BottomNavItem.vue'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, loginWithRedirect, logout } = useAuth0()
const userStore = useUserStore()

const active = computed(() => {
  const name = route.name ?? ''
  if (name === 'dashboard') return 'dashboard'
  if (name === 'portal') return 'portal'
  if (name === 'mein-medikamentenplan') return 'medplan'
  if (name === 'patient-list' || name.startsWith('aufnahme') || name === 'patient-detail' || name === 'patient-edit' || name === 'medikamentenplan') return 'patienten'
  if (name === 'betten') return 'betten'
  if (name.startsWith('admin')) return 'admin'
  if (name === 'profile') return 'account'
  return ''
})

function handleLogin() { loginWithRedirect() }
function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Hauptnavigation">
    <div class="nav-inner">

      <!-- Nicht eingeloggt -->
      <template v-if="!isAuthenticated">
        <BottomNavItem icon="bi-house" label="Home" :active="false" @click="router.push('/')" />
        <BottomNavItem icon="bi-box-arrow-in-right" label="Anmelden" :active="false" @click="handleLogin" />
      </template>

      <!-- Patient -->
      <template v-else-if="userStore.isPatient">
        <BottomNavItem icon="bi-grid" label="Mein Portal" :active="active === 'portal'" @click="router.push('/portal')" />
        <BottomNavItem icon="bi-capsule" label="Medikamente" :active="active === 'medplan'" @click="router.push('/mein-medikamentenplan')" />
        <BottomNavItem icon="bi-person-circle" label="Profil" :active="active === 'account'" @click="router.push('/profile')" />
        <BottomNavItem icon="bi-box-arrow-right" label="Abmelden" :active="false" @click="handleLogout" />
      </template>

      <!-- Staff (Arzt, Krankenschwester, Admin) -->
      <template v-else>
        <BottomNavItem icon="bi-grid" label="Dashboard" :active="active === 'dashboard'" @click="router.push('/dashboard')" />
        <BottomNavItem icon="bi-person-fill" label="Patienten" :active="active === 'patienten'" @click="router.push('/patients')" />
        <BottomNavItem icon="bi-hospital" label="Betten" :active="active === 'betten'" @click="router.push('/betten')" />
        <BottomNavItem icon="bi-person-circle" label="Profil" :active="active === 'account'" @click="router.push('/profile')" />
        <BottomNavItem icon="bi-box-arrow-right" label="Abmelden" :active="false" @click="handleLogout" />
      </template>

    </div>
  </nav>
</template>

<style scoped></style>
