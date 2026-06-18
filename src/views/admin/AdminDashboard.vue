<script setup>
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
</script>

<template>
  <AppHeader title="Administration" :show-back="true" back-route="/dashboard" />

  <main class="container">
    <p class="subtitle">Verwaltungsbereich für Administratoren.</p>

    <div class="card-grid">
      <button class="admin-card" @click="router.push('/admin/klinika')">
        <i class="bi bi-hospital"></i>
        <span class="card-title">Klinika</span>
        <span class="card-desc">Kliniken anlegen, bearbeiten und löschen.</span>
        <span class="card-link">Öffnen <i class="bi bi-arrow-right"></i></span>
      </button>

      <button class="admin-card" @click="router.push('/admin/users')">
        <i class="bi bi-people"></i>
        <span class="card-title">Benutzerverwaltung</span>
        <span class="card-desc">Benutzer anzeigen und bearbeiten.</span>
        <span class="card-link">Öffnen <i class="bi bi-arrow-right"></i></span>
      </button>

      <button class="admin-card" @click="router.push('/admin/medikamente')">
        <i class="bi bi-capsule"></i>
        <span class="card-title">Medikamentenverwaltung</span>
        <span class="card-desc">Medikamentenkatalog pflegen und archivieren.</span>
        <span class="card-link">Öffnen <i class="bi bi-arrow-right"></i></span>
      </button>

    </div>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 42rem; margin: 0 auto; }
.subtitle { color: var(--color-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }

.card-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }

@media (min-width: 30rem) {
  .card-grid { grid-template-columns: 1fr 1fr; }
}

.admin-card {
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
.admin-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); transform: translateY(-1px); }

.admin-card > .bi { font-size: 1.75rem; color: var(--color-primary); margin-bottom: 0.25rem; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--color-text); }
.card-desc { font-size: 0.85rem; color: var(--color-muted); }
.card-link { margin-top: 0.5rem; font-size: 0.85rem; color: var(--color-primary); font-weight: 600; display: flex; align-items: center; gap: 0.25rem; }
</style>
