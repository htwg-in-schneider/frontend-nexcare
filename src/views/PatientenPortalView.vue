<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useUserStore } from '@/stores/user.js'
import { fetchMeinPatient } from '@/api/profile.js'
import { fetchMedikamentenplan } from '@/api/medikamente.js'
import { fetchMeinAntrag, submitAntrag } from '@/api/aufnahmeAntrag.js'
import { fetchKlinika } from '@/api/klinika.js'
import { apiFetch } from '@/api/apiClient.js'

const router = useRouter()
const userStore = useUserStore()

const patient = ref(null)
const eintraege = ref([])
const loading = ref(true)
const fehler = ref(false)

// ─── Helpers ────────────────────────────────────────────────────────────────
const MONAT_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const JS_DAY_TO_CODE = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA']
const WOCHENTAG_LABELS = { MO: 'Mo', DI: 'Di', MI: 'Mi', DO: 'Do', FR: 'Fr', SA: 'Sa', SO: 'So' }

function formatDatum(iso) {
  if (!iso) return '–'
  const [y, m, d] = iso.split('-')
  return `${d}. ${MONAT_NAMES[Number(m) - 1]} ${y}`
}

function parseIso(s) {
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

const heute = new Date()
heute.setHours(0, 0, 0, 0)

// Heutige Medikamente
const heutigeEinnahmen = computed(() => {
  const code = JS_DAY_TO_CODE[heute.getDay()]
  return eintraege.value
    .filter(e => {
      const start = parseIso(e.startDatum)
      const end = parseIso(e.endDatum)
      return heute >= start && heute <= end && e.wochentage.split(',').includes(code)
    })
    .flatMap(e =>
      e.uhrzeiten.split(',').map(uhr => ({ ...e, uhr: uhr.trim() }))
    )
    .sort((a, b) => a.uhr.localeCompare(b.uhr))
})

// Nächste bevorstehende Einnahme
const naechsteEinnahme = computed(() => {
  const now = new Date()
  const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const heute = heutigeEinnahmen.value.find(e => e.uhr > nowStr)
  return heute ?? null
})

// ─── Aufnahme-Antrag ─────────────────────────────────────────────────────────
const klinika = ref([])
const meinAntrag = ref(null)
const antragForm = ref({ klinikumId: '', abteilung: '', station: '', nachricht: '' })
const antragSenden = ref(false)
const antragFehler = ref('')
const antragErfolg = ref(false)

async function ladeAntragDaten() {
  try {
    [klinika.value, meinAntrag.value] = await Promise.all([fetchKlinika(), fetchMeinAntrag()])
  } catch { /* ignorieren */ }
}

async function onAntragSenden() {
  if (!antragForm.value.klinikumId) { antragFehler.value = 'Bitte ein Klinikum auswählen.'; return }
  antragFehler.value = ''
  antragSenden.value = true
  try {
    meinAntrag.value = await submitAntrag({
      klinikumId: Number(antragForm.value.klinikumId),
      abteilung: antragForm.value.abteilung || null,
      station: antragForm.value.station || null,
      nachricht: antragForm.value.nachricht || null,
    })
    antragErfolg.value = true
  } catch (e) {
    antragFehler.value = e.message?.includes('409')
      ? 'Du hast bereits einen offenen Antrag.'
      : 'Fehler beim Senden. Bitte versuche es erneut.'
  } finally {
    antragSenden.value = false
  }
}

// ─── Kontaktformular ─────────────────────────────────────────────────────────
const kontakt = ref({ betreff: '', nachricht: '' })
const kontaktErgebnis = ref(null)

function onKontaktSenden() {
  const subject = encodeURIComponent(kontakt.value.betreff.trim())
  const body = encodeURIComponent(kontakt.value.nachricht.trim())
  window.location.href = `mailto:kontakt@nexcare.de?subject=${subject}&body=${body}`
  kontaktErgebnis.value = 'gesendet'
  kontakt.value = { betreff: '', nachricht: '' }
}

// ─── Nachrichten ─────────────────────────────────────────────────────────────
const nachrichten = ref([])

async function ladeNachrichten(patientId) {
  try {
    nachrichten.value = await apiFetch(`/api/patient/${patientId}/nachrichten`)
  } catch { /* ignorieren */ }
}

async function markiereGelesen(nachricht) {
  if (nachricht.gelesen) return
  try {
    await apiFetch(`/api/patient/${nachricht.patient.id}/nachrichten/${nachricht.id}/gelesen`, { method: 'PATCH' })
    nachricht.gelesen = true
  } catch { /* ignorieren */ }
}

const ungeleseneAnzahl = computed(() => nachrichten.value.filter(n => !n.gelesen).length)

const TYP_ICON = { WILLKOMMEN: 'bi-house-heart', AUFNAHME: 'bi-clipboard2-check', BETT: 'bi-hospital', MEDIKAMENT: 'bi-capsule', ALLGEMEIN: 'bi-bell' }
const TYP_COLOR = { WILLKOMMEN: '#2563eb', AUFNAHME: '#059669', BETT: '#d97706', MEDIKAMENT: '#7c3aed', ALLGEMEIN: '#64748b' }

function formatNachrichtDatum(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getDate()}. ${MONAT_NAMES[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
const colorMap = computed(() => {
  const map = {}
  eintraege.value.forEach((e, i) => { map[e.id] = COLORS[i % COLORS.length] })
  return map
})

const vollName = computed(() =>
  patient.value ? `${patient.value.vorname} ${patient.value.nachname}` : userStore.profile?.name ?? ''
)

const alter = computed(() => {
  if (!patient.value?.geburtsdatum) return null
  const [y, m, d] = patient.value.geburtsdatum.split('-').map(Number)
  const geb = new Date(y, m - 1, d)
  const diff = new Date(Date.now() - geb.getTime())
  return Math.abs(diff.getUTCFullYear() - 1970)
})

const hatBett = computed(() => patient.value?.bett || patient.value?.zimmer)

async function load() {
  loading.value = true
  fehler.value = false
  try {
    patient.value = await fetchMeinPatient()
    if (patient.value?.id) {
      eintraege.value = await fetchMedikamentenplan(patient.value.id)
      await ladeAntragDaten()
      await ladeNachrichten(patient.value.id)
    }
  } catch {
    fehler.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppHeader title="Mein Portal" :show-back="false" />

  <main class="portal-main">
    <p v-if="loading" class="state-msg">Lade deine Daten …</p>

    <div v-else-if="fehler" class="error-card">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <p>Dein Patientenprofil konnte nicht geladen werden.<br>Bitte wende dich an das Pflegepersonal.</p>
    </div>

    <template v-else>
      <!-- ── Begrüßung ── -->
      <div class="greeting">
        <h2>Guten Tag, <span class="name">{{ vollName.split(' ')[0] }}</span>.</h2>
        <p class="sub">Willkommen in deinem persönlichen Patientenportal.</p>
      </div>

      <!-- ── Status-Banner ── -->
      <div v-if="patient" class="status-banner" :class="patient.status?.toLowerCase()">
        <i class="bi" :class="patient.status === 'STATIONAER' ? 'bi-hospital-fill' : patient.status === 'ENTLASSEN' ? 'bi-house-check-fill' : 'bi-clock-history'"></i>
        <span>{{ patient.status === 'STATIONAER' ? 'Stationär aufgenommen' : patient.status === 'ENTLASSEN' ? 'Entlassen' : patient.status ?? 'Unbekannt' }}</span>
      </div>

      <!-- ── Nachrichten ── -->
      <div v-if="nachrichten.length" class="card nachrichten-card">
        <div class="card-head">
          <i class="bi bi-bell-fill card-icon" style="color:#2563eb"></i>
          <h3>Nachrichten</h3>
          <span v-if="ungeleseneAnzahl" class="badge-ungelesen">{{ ungeleseneAnzahl }}</span>
        </div>
        <ul class="nachrichten-list">
          <li
            v-for="n in nachrichten"
            :key="n.id"
            :class="['nachricht-item', !n.gelesen && 'ungelesen']"
            @click="markiereGelesen(n)"
          >
            <span class="nachricht-icon" :style="{ background: TYP_COLOR[n.typ] + '18', color: TYP_COLOR[n.typ] }">
              <i class="bi" :class="TYP_ICON[n.typ] ?? 'bi-bell'"></i>
            </span>
            <div class="nachricht-body">
              <div class="nachricht-titel">{{ n.titel }}</div>
              <div class="nachricht-inhalt">{{ n.inhalt }}</div>
              <div class="nachricht-datum">{{ formatNachrichtDatum(n.erstelltAm) }}</div>
            </div>
            <span v-if="!n.gelesen" class="dot-ungelesen"></span>
          </li>
        </ul>
      </div>

      <div class="cards">
        <!-- ── Persönliche Daten ── -->
        <div class="card" v-if="patient">
          <div class="card-head">
            <i class="bi bi-person-fill card-icon"></i>
            <h3>Meine Daten</h3>
          </div>
          <dl class="info-list">
            <div class="info-row">
              <dt>Name</dt>
              <dd>{{ patient.vorname }} {{ patient.nachname }}</dd>
            </div>
            <div class="info-row" v-if="patient.geburtsdatum">
              <dt>Geburtsdatum</dt>
              <dd>{{ formatDatum(patient.geburtsdatum) }}<span v-if="alter" class="muted"> ({{ alter }} Jahre)</span></dd>
            </div>
            <div class="info-row" v-if="patient.versicherungsnr">
              <dt>Versicherungsnr.</dt>
              <dd>{{ patient.versicherungsnr }}</dd>
            </div>
            <div class="info-row" v-if="patient.email">
              <dt>E-Mail</dt>
              <dd>{{ patient.email }}</dd>
            </div>
            <div class="info-row" v-if="patient.telefon">
              <dt>Telefon</dt>
              <dd>{{ patient.telefon }}</dd>
            </div>
            <div class="info-row" v-if="patient.adresse">
              <dt>Adresse</dt>
              <dd>{{ patient.adresse }}</dd>
            </div>
          </dl>
        </div>

        <!-- ── Aktuelles Bett / Zimmer ── -->
        <div class="card" v-if="patient">
          <div class="card-head">
            <i class="bi bi-hospital card-icon teal"></i>
            <h3>Mein Zimmer</h3>
          </div>
          <template v-if="hatBett">
            <dl class="info-list">
              <div class="info-row" v-if="patient.klinikum?.name">
                <dt>Klinikum</dt>
                <dd>{{ patient.klinikum.name }}</dd>
              </div>
              <div class="info-row" v-if="patient.etage">
                <dt>Etage</dt>
                <dd>{{ patient.etage }}</dd>
              </div>
              <div class="info-row" v-if="patient.abteilung">
                <dt>Abteilung</dt>
                <dd>{{ patient.abteilung }}</dd>
              </div>
              <div class="info-row" v-if="patient.station">
                <dt>Station</dt>
                <dd>{{ patient.station }}</dd>
              </div>
              <div class="info-row" v-if="patient.zimmer">
                <dt>Zimmer</dt>
                <dd>{{ patient.zimmer }}</dd>
              </div>
              <div class="info-row" v-if="patient.bett">
                <dt>Bett</dt>
                <dd>{{ patient.bett }}</dd>
              </div>
            </dl>
          </template>
          <p v-else class="empty-hint"><i class="bi bi-info-circle"></i> Noch kein Bett zugewiesen.</p>
        </div>

        <!-- ── Heutige Einnahmen ── -->
        <div class="card">
          <div class="card-head">
            <i class="bi bi-capsule card-icon amber"></i>
            <h3>Medikamente heute</h3>
          </div>
          <template v-if="heutigeEinnahmen.length">
            <div
              v-for="ev in heutigeEinnahmen"
              :key="`${ev.id}-${ev.uhr}`"
              class="med-row"
              :style="{ borderColor: colorMap[ev.id] }"
            >
              <span class="med-uhr" :style="{ color: colorMap[ev.id] }">{{ ev.uhr }}</span>
              <div class="med-info">
                <span class="med-name">{{ ev.medikament.name }}</span>
                <span class="med-dos">{{ ev.dosierung }}</span>
              </div>
            </div>
          </template>
          <p v-else class="empty-hint"><i class="bi bi-check2-circle"></i> Heute keine Einnahmen geplant.</p>

          <button class="link-btn" @click="router.push(`/mein-medikamentenplan`)">
            Vollständiger Medikamentenplan <i class="bi bi-arrow-right"></i>
          </button>
        </div>

        <!-- ── Nächste Einnahme ── -->
        <div v-if="naechsteEinnahme" class="card next-card">
          <div class="card-head">
            <i class="bi bi-alarm card-icon purple"></i>
            <h3>Nächste Einnahme</h3>
          </div>
          <div class="next-info">
            <span class="next-time">{{ naechsteEinnahme.uhr }} Uhr</span>
            <span class="next-name">{{ naechsteEinnahme.medikament.name }}</span>
            <span class="next-dos">{{ naechsteEinnahme.dosierung }}</span>
          </div>
        </div>

        <!-- ── Notfallkontakt ── -->
        <div class="card" v-if="patient?.notfallkontakt?.name">
          <div class="card-head">
            <i class="bi bi-telephone-fill card-icon red"></i>
            <h3>Notfallkontakt</h3>
          </div>
          <dl class="info-list">
            <div class="info-row">
              <dt>Name</dt>
              <dd>{{ patient.notfallkontakt.name }}</dd>
            </div>
            <div class="info-row" v-if="patient.notfallkontakt.beziehung">
              <dt>Beziehung</dt>
              <dd>{{ patient.notfallkontakt.beziehung }}</dd>
            </div>
            <div class="info-row" v-if="patient.notfallkontakt.telefon">
              <dt>Telefon</dt>
              <dd><a :href="`tel:${patient.notfallkontakt.telefon}`">{{ patient.notfallkontakt.telefon }}</a></dd>
            </div>
          </dl>
        </div>

        <!-- ── Aufnahme beantragen (nur ohne aktive Aufnahme) ── -->
        <div v-if="!patient" class="card">
          <div class="card-head">
            <i class="bi bi-hospital-fill card-icon blue"></i>
            <h3>Krankenhausaufnahme beantragen</h3>
          </div>

          <div v-if="meinAntrag || antragErfolg" class="zahlung-success">
            <i class="bi bi-hourglass-split"></i>
            <span>Dein Antrag ist eingegangen und wird vom Klinikum-Personal geprüft.</span>
          </div>

          <form v-else class="kontakt-form" @submit.prevent="onAntragSenden" novalidate>
            <p style="font-size:.85rem;color:var(--color-muted);margin:0 0 .5rem;">
              Du bist noch nicht stationär aufgenommen. Stelle hier einen Aufnahmeantrag, der vom medizinischen Personal bestätigt wird.
            </p>
            <label>
              <span>Klinikum<span class="required-mark">*</span></span>
              <select v-model="antragForm.klinikumId" required title="Gewünschtes Klinikum (Pflichtfeld)">
                <option value="">– bitte wählen –</option>
                <option v-for="k in klinika" :key="k.id" :value="k.id">{{ k.name }}</option>
              </select>
            </label>
            <label>
              <span>Gewünschte Abteilung</span>
              <input v-model="antragForm.abteilung" type="text" title="Abteilung (optional, maximal 100 Zeichen)" placeholder="z.B. Kardiologie" maxlength="100" />
            </label>
            <label>
              <span>Station</span>
              <input v-model="antragForm.station" type="text" title="Station (optional, maximal 100 Zeichen)" placeholder="z.B. Station K3" maxlength="100" />
            </label>
            <label>
              <span>Nachricht ans Personal</span>
              <textarea v-model="antragForm.nachricht" title="Optionale Nachricht an das medizinische Personal (maximal 1000 Zeichen)" placeholder="Beschreibe kurz den Grund deines Aufenthalts …" rows="3" maxlength="1000"></textarea>
            </label>
            <p v-if="antragFehler" class="zahlung-fehler"><i class="bi bi-exclamation-triangle"></i> {{ antragFehler }}</p>
            <button type="submit" class="zahlung-btn" :disabled="antragSenden || !antragForm.klinikumId">
              <i class="bi bi-send-fill"></i>
              {{ antragSenden ? 'Wird gesendet …' : 'Aufnahmeantrag stellen' }}
            </button>
          </form>
        </div>

        <!-- ── Kontaktformular ── -->
        <div class="card">
          <div class="card-head">
            <i class="bi bi-envelope-fill card-icon blue"></i>
            <h3>Kontakt aufnehmen</h3>
          </div>

          <div v-if="kontaktErgebnis === 'gesendet'" class="kontakt-success">
            <i class="bi bi-check-circle-fill"></i>
            <span>Nachricht erfolgreich gesendet!</span>
          </div>
          <div v-else-if="kontaktErgebnis === 'fehler'" class="zahlung-fehler">
            <i class="bi bi-exclamation-triangle"></i> Fehler beim Senden. Bitte versuche es erneut.
          </div>

          <form v-if="kontaktErgebnis !== 'gesendet'" class="kontakt-form" @submit.prevent="onKontaktSenden" novalidate>
            <label>
              <span>Betreff<span class="required-mark">*</span></span>
              <input v-model="kontakt.betreff" type="text" title="Betreff der Nachricht" placeholder="Frage zu meinem Aufenthalt" maxlength="200" required />
            </label>
            <label>
              <span>Nachricht<span class="required-mark">*</span></span>
              <textarea v-model="kontakt.nachricht" title="Deine Nachricht" placeholder="Schreibe deine Nachricht hier …" maxlength="2000" rows="4" required></textarea>
            </label>
            <button
              type="submit"
              class="zahlung-btn"
              :disabled="!kontakt.betreff.trim() || !kontakt.nachricht.trim()"
            >
              <i class="bi bi-envelope-fill"></i>
              E-Mail-Programm öffnen
            </button>
          </form>
        </div>

      </div>
    </template>
  </main>
</template>

<style scoped>
.portal-main { padding: 0 1rem 6rem; max-width: 42rem; margin: 0 auto; }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 3rem; }

.error-card {
  margin-top: 2rem; padding: 2rem; text-align: center;
  background: #fef2f2; border: 0.0625rem solid #fca5a5; border-radius: var(--radius-card);
  color: #7f1d1d;
}
.error-card i { font-size: 2rem; display: block; margin-bottom: 0.75rem; }

.greeting { padding: 1.25rem 0 0.75rem; }
.greeting h2 { margin: 0 0 0.25rem; font-size: 1.4rem; font-weight: 700; color: var(--color-text); }
.greeting .name { color: var(--color-primary); }
.greeting .sub { margin: 0; font-size: 0.88rem; color: var(--color-muted); }

.status-banner {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.875rem; border-radius: 2rem;
  font-size: 0.82rem; font-weight: 600;
  margin-bottom: 1rem;
  width: fit-content;
}
.status-banner.stationaer { background: #edfaf4; color: #1b6b40; }
.status-banner.entlassen { background: #edf4ff; color: #1b4f8a; }
.status-banner:not(.stationaer):not(.entlassen) { background: var(--color-surface); color: var(--color-muted); }

.cards { display: flex; flex-direction: column; gap: 1rem; }

.card {
  background: var(--color-card);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem 1.125rem;
}

.card-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.875rem; }
.card-head h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--color-text); }
.card-icon { font-size: 1.1rem; color: var(--color-primary); }
.card-icon.teal { color: #0d9488; }
.card-icon.amber { color: #d97706; }
.card-icon.purple { color: #7c3aed; }
.card-icon.red { color: #dc2626; }

.info-list { margin: 0; }
.info-row { display: flex; gap: 0.5rem; padding: 0.35rem 0; border-bottom: 0.0625rem solid var(--color-border); }
.info-row:last-child { border-bottom: none; }
dt { font-size: 0.8rem; color: var(--color-muted); width: 7rem; flex-shrink: 0; padding-top: 0.05rem; }
dd { font-size: 0.88rem; color: var(--color-text); margin: 0; font-weight: 500; }
.muted { color: var(--color-muted); font-weight: 400; }

.empty-hint { font-size: 0.85rem; color: var(--color-muted); margin: 0 0 0.75rem; display: flex; align-items: center; gap: 0.4rem; }

.med-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 0.625rem; margin-bottom: 0.375rem;
  border-left: 0.2rem solid; border-radius: 0.375rem;
  background: var(--color-surface);
}
.med-uhr { font-size: 0.82rem; font-weight: 700; width: 3rem; flex-shrink: 0; }
.med-info { display: flex; flex-direction: column; }
.med-name { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
.med-dos { font-size: 0.78rem; color: var(--color-muted); }

.link-btn {
  margin-top: 0.75rem; display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.85rem; color: var(--color-primary); font-weight: 600;
  background: none; border: none; cursor: pointer; padding: 0;
  font-family: inherit;
}
.link-btn:hover { text-decoration: underline; }

.next-card { border-color: #c4b5fd; background: #faf5ff; }
.next-info { display: flex; flex-direction: column; gap: 0.15rem; }
.next-time { font-size: 1.8rem; font-weight: 700; color: #7c3aed; line-height: 1; }
.next-name { font-size: 1rem; font-weight: 600; color: var(--color-text); }
.next-dos { font-size: 0.85rem; color: var(--color-muted); }

.card-icon.green { color: #059669; }
.card-icon.blue { color: #2563eb; }
.zahlung-success {
  display: flex; align-items: center; gap: 0.5rem;
  color: #059669; font-weight: 600; font-size: 0.95rem;
  margin-bottom: 0.875rem;
}
.zahlung-success i { font-size: 1.2rem; }
.zahlung-fehler { font-size: 0.83rem; color: #b3372e; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.35rem; }
.zahlung-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; margin-top: 1rem;
  padding: 0.875rem 1.25rem;
  background: var(--color-primary); color: #fff;
  border: none; border-radius: var(--radius-card);
  font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.zahlung-btn:hover:not(:disabled) { filter: brightness(1.08); }
.zahlung-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Kontaktformular */
.kontakt-form { display: flex; flex-direction: column; gap: 0.75rem; }
.kontakt-form label { display: flex; flex-direction: column; gap: 0.25rem; }
.kontakt-form label > span { font-size: 0.82rem; color: var(--color-muted); font-weight: 500; }
.kontakt-form input,
.kontakt-form textarea,
.kontakt-form select {
  padding: 0.5rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.9rem; color: var(--color-text); font-family: inherit; background: #fff;
  resize: vertical;
  width: 100%;
}
.kontakt-form input:focus,
.kontakt-form textarea:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.kontakt-success {
  display: flex; align-items: center; gap: 0.5rem;
  color: #059669; font-weight: 600; font-size: 0.9rem;
  padding: 0.75rem; background: #f0fdf9; border-radius: 0.5rem;
}

/* ── Nachrichten ── */
.nachrichten-card { margin-bottom: 1rem; }
.badge-ungelesen {
  margin-left: auto; background: #2563eb; color: #fff;
  font-size: 0.72rem; font-weight: 700; border-radius: 9999px;
  padding: 0.1rem 0.5rem; min-width: 1.25rem; text-align: center;
}
.nachrichten-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.nachricht-item {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.75rem; border-radius: 0.625rem;
  border: 1px solid var(--color-border); cursor: pointer;
  transition: background 0.12s;
}
.nachricht-item:hover { background: var(--color-surface); }
.nachricht-item.ungelesen { background: #f0f6ff; border-color: #bfdbfe; }
.nachricht-icon {
  width: 2.25rem; height: 2.25rem; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1rem;
}
.nachricht-body { flex: 1; min-width: 0; }
.nachricht-titel { font-size: 0.88rem; font-weight: 700; color: var(--color-text); }
.nachricht-inhalt { font-size: 0.82rem; color: var(--color-muted); margin-top: 0.15rem; line-height: 1.5; }
.nachricht-datum { font-size: 0.75rem; color: var(--color-muted); margin-top: 0.3rem; }
.dot-ungelesen {
  width: 0.5rem; height: 0.5rem; border-radius: 50%;
  background: #2563eb; flex-shrink: 0; margin-top: 0.35rem;
}
.required-mark { color: #ef4444; margin-left: 0.15rem; }
</style>
