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

const cards = computed(() => {
  const all = [
    {
      icon: 'bi-person-lines-fill',
      title: 'Patienten',
      desc: 'Patientenliste anzeigen und filtern.',
      route: '/patients',
      always: true,
    },
    {
      icon: 'bi-hospital',
      title: 'Bettenverwaltung',
      desc: 'Belegung anzeigen, Betten zuweisen und freigeben.',
      route: '/betten',
      always: true,
    },
    {
      icon: 'bi-person-circle',
      title: 'Mein Profil',
      desc: 'Eigene Kontaktdaten anzeigen und bearbeiten.',
      route: '/profile',
      always: true,
    },
    {
      icon: 'bi-shield-check',
      title: 'Administration',
      desc: 'Klinika, Benutzer und Medikamentenkatalog verwalten.',
      route: '/admin',
      adminOnly: true,
    },
  ]
  return all.filter(c => c.always || (c.adminOnly && userStore.isAdmin))
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
        v-for="card in cards"
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
  </main>
</template>

<style scoped>
.container {
  padding: 1rem 1rem 6rem;
  max-width: 42rem;
  margin: 0 auto;
}

.greeting {
  margin-bottom: 1.5rem;
}
.hello {
  margin: 0 0 0.25rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}
.role-badge {
  display: inline-block;
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-radius: 2rem;
  padding: 0.2rem 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 30rem) {
  .card-grid { grid-template-columns: 1fr 1fr; }
}

.dash-card {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.375rem;
  cursor: pointer;
  text-align: left;
  transition: box-shadow 0.15s, transform 0.15s;
}
.dash-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); transform: translateY(-1px); }
.dash-card > .bi { font-size: 1.75rem; color: var(--color-primary); margin-bottom: 0.25rem; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--color-text); }
.card-desc { font-size: 0.85rem; color: var(--color-muted); }
.card-link {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
