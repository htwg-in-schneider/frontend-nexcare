<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { authHeaders } from '@/api/auth.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const logs = ref([])
const loading = ref(true)

const TYPE_LABELS = {
  WILLKOMMEN:              'Willkommen',
  AUFNAHME_BESTAETIGT:     'Aufnahme bestätigt',
  ZAHLUNG:                 'Zahlungsbestätigung',
  KONTAKT:                 'Kontaktanfrage',
  MEDIKAMENT_VERSCHRIEBEN: 'Medikament verschrieben',
  BETT_ZUGEWIESEN:         'Bett zugewiesen',
  MEDIKAMENTENPLAN:        'Medikamentenplan',
}

const TYPE_ICONS = {
  WILLKOMMEN:              'bi-person-plus',
  AUFNAHME_BESTAETIGT:     'bi-clipboard2-check',
  ZAHLUNG:                 'bi-credit-card',
  KONTAKT:                 'bi-envelope',
  MEDIKAMENT_VERSCHRIEBEN: 'bi-capsule',
  BETT_ZUGEWIESEN:         'bi-hospital',
  MEDIKAMENTENPLAN:        'bi-calendar2-week',
}

onMounted(load)

async function load() {
  loading.value = true
  try {
    const opts = await authHeaders()
    const res = await fetch(`${BASE}/api/admin/email-log?limit=200`, opts)
    logs.value = res.ok ? await res.json() : []
  } catch {
    logs.value = []
  }
  loading.value = false
}

function formatDt(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function typeLabel(t) { return TYPE_LABELS[t] ?? t }
function typeIcon(t) { return TYPE_ICONS[t] ?? 'bi-envelope' }
</script>

<template>
  <AppHeader title="E-Mail-Protokoll" :show-back="true" back-route="/dashboard" />

  <main class="container">
    <p class="intro">Übersicht der zuletzt versendeten E-Mails (max. 200).</p>

    <p v-if="loading" class="state-msg">Lade …</p>
    <p v-else-if="!logs.length" class="state-msg empty">
      <i class="bi bi-inbox"></i> Noch keine E-Mails versendet.
    </p>

    <div v-else class="log-table-wrap">
      <table class="log-table">
        <thead>
          <tr>
            <th>Typ</th>
            <th>Empfänger</th>
            <th>Betreff</th>
            <th>Zeitpunkt</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" :class="{ 'row-fail': !log.success }">
            <td>
              <span class="type-badge">
                <i :class="['bi', typeIcon(log.emailType)]"></i>
                {{ typeLabel(log.emailType) }}
              </span>
            </td>
            <td class="cell-recipient">{{ log.recipient }}</td>
            <td class="cell-subject">{{ log.subject }}</td>
            <td class="cell-dt">{{ formatDt(log.sentAt) }}</td>
            <td>
              <span v-if="log.success" class="badge-ok">
                <i class="bi bi-check-circle-fill"></i> Gesendet
              </span>
              <span v-else class="badge-fail" :title="log.errorMessage">
                <i class="bi bi-x-circle-fill"></i> Fehler
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 72rem; margin: 0 auto; }
.intro { color: var(--color-muted); font-size: .875rem; margin: 0 0 1.25rem; }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }
.state-msg.empty { display: flex; align-items: center; justify-content: center; gap: .5rem; }

.log-table-wrap {
  background: var(--color-card);
  border: .0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow-x: auto;
}
.log-table {
  width: 100%; border-collapse: collapse;
  font-size: .85rem;
}
.log-table th {
  background: var(--color-bg);
  padding: .75rem 1rem;
  text-align: left;
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--color-muted);
  border-bottom: .0625rem solid var(--color-border);
}
.log-table td {
  padding: .75rem 1rem;
  border-bottom: .0625rem solid var(--color-border);
  vertical-align: middle;
}
.log-table tr:last-child td { border-bottom: none; }
.log-table tr.row-fail { background: #fff5f5; }

.type-badge {
  display: inline-flex; align-items: center; gap: .35rem;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  border-radius: 2rem;
  padding: .2rem .6rem;
  font-size: .775rem; font-weight: 600;
  white-space: nowrap;
}

.cell-recipient { font-weight: 600; color: var(--color-text); max-width: 14rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-subject { color: var(--color-muted); max-width: 22rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-dt { white-space: nowrap; color: var(--color-muted); }

.badge-ok, .badge-fail {
  display: inline-flex; align-items: center; gap: .3rem;
  border-radius: 2rem; padding: .2rem .6rem;
  font-size: .775rem; font-weight: 600; white-space: nowrap;
}
.badge-ok  { background: #dcfce7; color: #15803d; }
.badge-fail { background: #fee2e2; color: #b91c1c; cursor: help; }
</style>
