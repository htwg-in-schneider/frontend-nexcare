<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { fetchOffeneAntraege, bestaetigen, ablehnen } from '@/api/aufnahmeAntrag.js'

const ui = useUiStore()
const antraege = ref([])
const loading = ref(true)

onMounted(load)

async function load() {
  loading.value = true
  try { antraege.value = await fetchOffeneAntraege() } catch { antraege.value = [] }
  loading.value = false
}

function formatDt(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

async function onBestaetigen(antrag) {
  const ok = await ui.confirm({
    title: 'Aufnahme bestätigen',
    message: `Aufnahmeantrag von ${antrag.patientName} für ${antrag.klinikum?.name} bestätigen?`,
    confirmLabel: 'Bestätigen',
    cancelLabel: 'Abbrechen',
  })
  if (!ok) return
  try {
    await bestaetigen(antrag.id)
    ui.showToast('Aufnahme bestätigt.', { variant: 'success' })
    await load()
  } catch {
    ui.showToast('Fehler beim Bestätigen.', { variant: 'error' })
  }
}

async function onAblehnen(antrag) {
  const ok = await ui.confirm({
    title: 'Antrag ablehnen',
    message: `Aufnahmeantrag von ${antrag.patientName} ablehnen?`,
    confirmLabel: 'Ablehnen',
    cancelLabel: 'Abbrechen',
  })
  if (!ok) return
  try {
    await ablehnen(antrag.id)
    ui.showToast('Antrag abgelehnt.')
    await load()
  } catch {
    ui.showToast('Fehler beim Ablehnen.', { variant: 'error' })
  }
}
</script>

<template>
  <AppHeader title="Aufnahmeanträge" :show-back="true" back-route="/patients" />

  <main class="container">
    <p v-if="loading" class="state-msg">Lade …</p>
    <p v-else-if="!antraege.length" class="state-msg empty">
      <i class="bi bi-check2-circle"></i> Keine offenen Aufnahmeanträge.
    </p>

    <ul v-else class="antrag-list">
      <li v-for="a in antraege" :key="a.id" class="antrag-card">
        <div class="antrag-head">
          <div class="antrag-avatar">{{ (a.patientName ?? '?').charAt(0).toUpperCase() }}</div>
          <div class="antrag-info">
            <span class="antrag-name">{{ a.patientName }}</span>
            <span class="antrag-email">{{ a.patientEmail }}</span>
          </div>
          <span class="antrag-dt">{{ formatDt(a.erstelltAm) }}</span>
        </div>

        <dl class="antrag-details">
          <div class="detail-row">
            <dt>Klinikum</dt>
            <dd>{{ a.klinikum?.name ?? '–' }}</dd>
          </div>
          <div class="detail-row" v-if="a.abteilung">
            <dt>Abteilung</dt>
            <dd>{{ a.abteilung }}</dd>
          </div>
          <div class="detail-row" v-if="a.station">
            <dt>Station</dt>
            <dd>{{ a.station }}</dd>
          </div>
          <div class="detail-row" v-if="a.nachricht">
            <dt>Nachricht</dt>
            <dd class="nachricht">{{ a.nachricht }}</dd>
          </div>
        </dl>

        <div class="antrag-actions">
          <button class="btn-bestaetigen" @click="onBestaetigen(a)">
            <i class="bi bi-check-lg"></i> Bestätigen
          </button>
          <button class="btn-ablehnen" @click="onAblehnen(a)">
            <i class="bi bi-x-lg"></i> Ablehnen
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.container { padding: 1rem 1rem 6rem; max-width: 48rem; margin: 0 auto; }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }
.state-msg.empty { display: flex; align-items: center; justify-content: center; gap: .5rem; font-size: .95rem; }

.antrag-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .875rem; }
.antrag-card {
  background: var(--color-card);
  border: .0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.125rem;
}
.antrag-head { display: flex; align-items: center; gap: .75rem; margin-bottom: .875rem; }
.antrag-avatar {
  width: 2.25rem; height: 2.25rem; border-radius: 50%;
  background: #dbeafe; color: #1d4ed8;
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 700; flex-shrink: 0;
}
.antrag-info { flex: 1; display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
.antrag-name { font-weight: 700; font-size: .9rem; color: var(--color-text); }
.antrag-email { font-size: .75rem; color: var(--color-muted); }
.antrag-dt { font-size: .75rem; color: var(--color-muted); white-space: nowrap; flex-shrink: 0; }

.antrag-details { margin: 0 0 .875rem; }
.detail-row { display: flex; gap: .5rem; padding: .3rem 0; border-bottom: .0625rem solid var(--color-border); }
.detail-row:last-child { border-bottom: none; }
dt { font-size: .8rem; color: var(--color-muted); width: 6rem; flex-shrink: 0; }
dd { margin: 0; font-size: .85rem; color: var(--color-text); }
.nachricht { font-style: italic; white-space: pre-wrap; }

.antrag-actions { display: flex; gap: .625rem; }
.btn-bestaetigen, .btn-ablehnen {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: .375rem;
  padding: .625rem 1rem; border: none; border-radius: .625rem;
  font-size: .875rem; font-weight: 600; cursor: pointer; font-family: inherit;
}
.btn-bestaetigen { background: #dcfce7; color: #15803d; }
.btn-bestaetigen:hover { background: #bbf7d0; }
.btn-ablehnen { background: #fee2e2; color: #b91c1c; }
.btn-ablehnen:hover { background: #fecaca; }
</style>
