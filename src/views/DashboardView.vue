<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '@/stores/user.js'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const { user } = useAuth0()
const userStore = useUserStore()

const firstName = computed(() => {
  const name = userStore.profile?.name ?? user.value?.name ?? ''
  return name.split(' ')[0]
})

const mainCards = computed(() => [
  {
    icon: 'bi-person-lines-fill',
    title: 'Patienten',
    desc: 'Patientenliste anzeigen und filtern.',
    route: '/patients',
  },
  {
    icon: 'bi-hospital',
    title: 'Bettenverwaltung',
    desc: userStore.isAdmin
      ? 'Struktur verwalten, Betten zuweisen und freigeben.'
      : 'Belegung anzeigen und Patienten Betten zuweisen.',
    route: '/betten',
  },
  {
    icon: 'bi-person-circle',
    title: 'Mein Profil',
    desc: 'Eigene Kontaktdaten anzeigen und bearbeiten.',
    route: '/profile',
  },
  {
    icon: 'bi-clipboard2-check',
    title: 'Aufnahmeanträge',
    desc: 'Offene Patientenanträge prüfen und bestätigen.',
    route: '/aufnahme-antraege',
  },
])

const adminCards = computed(() => {
  if (!userStore.isAdmin) return []
  return [
    {
      icon: 'bi-hospital-fill',
      title: 'Klinika',
      desc: 'Kliniken anlegen, bearbeiten und löschen.',
      route: '/admin/klinika',
    },
    {
      icon: 'bi-people',
      title: 'Benutzerverwaltung',
      desc: 'Benutzer anzeigen und bearbeiten.',
      route: '/admin/users',
    },
    {
      icon: 'bi-capsule',
      title: 'Medikamentenverwaltung',
      desc: 'Medikamentenkatalog pflegen und archivieren.',
      route: '/admin/medikamente',
    },
    {
      icon: 'bi-gear-fill',
      title: 'Einstellungen',
      desc: 'Admin-E-Mail und Systemkonfiguration verwalten.',
      route: '/admin/einstellungen',
    },
    {
      icon: 'bi-envelope-check',
      title: 'E-Mail-Protokoll',
      desc: 'Übersicht aller versendeten E-Mails und Status.',
      route: '/admin/email-log',
    },
  ]
})
</script>

<template>
  <AppHeader title="Dashboard" :show-back="false" />

  <main class="container">
    <div class="greeting">
      <h2 class="hello">Guten Tag<span v-if="firstName">, {{ firstName }}</span>.</h2>
      <p class="role-badge">{{ userStore.profile?.role ?? '–' }}</p>
    </div>

    <div class="card-grid">
      <button
        v-for="card in mainCards"
        :key="card.route"
        class="dash-card"
        @click="router.push(card.route)"
      >
        <i :class="['bi', card.icon]"></i>
        <span class="card-title">{{ card.title }}</span>
        <span class="card-desc">{{ card.desc }}</span>
        <span class="card-link">Öffnen <i class="bi bi-arrow-right"></i></span>
      </button>
    </div>

    <template v-if="adminCards.length">
      <h3 class="section-title">Administration</h3>
      <div class="card-grid">
        <button
          v-for="card in adminCards"
          :key="card.route"
          class="dash-card admin"
          @click="router.push(card.route)"
        >
          <i :class="['bi', card.icon]"></i>
          <span class="card-title">{{ card.title }}</span>
          <span class="card-desc">{{ card.desc }}</span>
          <span class="card-link">Öffnen <i class="bi bi-arrow-right"></i></span>
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.container {
  padding: 1rem 1rem 6rem;
  max-width: 42rem;
  margin: 0 auto;
}

.greeting { margin-bottom: 1.5rem; }
.hello { margin: 0 0 0.25rem; font-size: 1.4rem; font-weight: 700; color: var(--color-text); }
.role-badge {
  display: inline-block; margin: 0; font-size: 0.78rem; font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-radius: 2rem; padding: 0.2rem 0.75rem;
  text-transform: uppercase; letter-spacing: 0.05em;
}

.section-title {
  font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--color-muted);
  margin: 1.5rem 0 0.75rem;
}

.card-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 30rem) {
  .card-grid { grid-template-columns: 1fr 1fr; }
}

.dash-card {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1.5rem 1.25rem;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 0.375rem; cursor: pointer; text-align: left;
  transition: box-shadow 0.15s, transform 0.15s;
}
.dash-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); transform: translateY(-1px); }
.dash-card > .bi { font-size: 1.75rem; color: var(--color-primary); margin-bottom: 0.25rem; }
.dash-card.admin > .bi { color: #7c3aed; }

.card-title { font-size: 1rem; font-weight: 700; color: var(--color-text); }
.card-desc { font-size: 0.85rem; color: var(--color-muted); }
.card-link {
  margin-top: 0.5rem; font-size: 0.85rem; color: var(--color-primary);
  font-weight: 600; display: flex; align-items: center; gap: 0.25rem;
}
.dash-card.admin .card-link { color: #7c3aed; }
</style>
