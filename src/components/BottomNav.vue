<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import BottomNavItem from './BottomNavItem.vue'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

// Admin-Erkennung über Auth0-Claim (wird nach Login aus Backend-Profil bestimmt)
// Hier nutzen wir den Pinia-Store falls verfügbar, sonst nur Login-Status
const isAdmin = computed(() => {
  // Auth0 custom claim für Rolle, gesetzt über Auth0 Actions/Rules
  const roles = user.value?.['https://nexcare.api/roles'] ?? []
  return roles.includes('ADMIN')
})

const active = computed(() => {
  const name = route.name ?? ''
  if (name === 'patient-list') return 'patienten'
  if (name.startsWith('admin')) return 'admin'
  if (name === 'profile') return 'account'
  if (name.startsWith('aufnahme')) return 'patienten'
  return ''
})

function handleLogin() {
  loginWithRedirect()
}

function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Hauptnavigation">
    <div class="nav-inner">
      <BottomNavItem
        icon="bi-house"
        label="Home"
        :active="false"
        @click="router.push('/')"
      />
      <BottomNavItem
        icon="bi-person-fill"
        label="Patienten"
        :active="active === 'patienten'"
        @click="router.push('/patients')"
      />
      <BottomNavItem
        v-if="isAuthenticated && isAdmin"
        icon="bi-shield-check"
        label="Admin"
        :active="active === 'admin'"
        @click="router.push('/admin')"
      />
      <BottomNavItem
        v-if="isAuthenticated"
        icon="bi-person-circle"
        label="Profil"
        :active="active === 'account'"
        @click="router.push('/profile')"
      />
      <BottomNavItem
        v-if="isAuthenticated"
        icon="bi-box-arrow-right"
        label="Abmelden"
        :active="false"
        @click="handleLogout"
      />
      <BottomNavItem
        v-else
        icon="bi-box-arrow-in-right"
        label="Anmelden"
        :active="false"
        @click="handleLogin"
      />
    </div>
  </nav>
</template>

<style scoped></style>
