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
  if (name === 'patient-list' || name.startsWith('aufnahme') || name === 'patient-detail' || name === 'patient-edit' || name === 'medikamentenplan') return 'patienten'
  if (name === 'betten') return 'betten'
  if (name.startsWith('admin')) return 'admin'
  if (name === 'profile') return 'account'
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
        v-if="isAuthenticated"
        icon="bi-grid"
        label="Dashboard"
        :active="active === 'dashboard'"
        @click="router.push('/dashboard')"
      />
      <BottomNavItem
        icon="bi-person-fill"
        label="Patienten"
        :active="active === 'patienten'"
        @click="router.push('/patients')"
      />
      <BottomNavItem
        v-if="isAuthenticated"
        icon="bi-hospital"
        label="Betten"
        :active="active === 'betten'"
        @click="router.push('/betten')"
      />
      <BottomNavItem
        v-if="isAuthenticated && userStore.isAdmin"
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
