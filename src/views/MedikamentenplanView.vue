<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useUiStore } from '@/stores/ui.js'
import { useUserStore } from '@/stores/user.js'
import { useFormValidation } from '@/composables/useFormValidation.js'
import {
  fetchMedikamentenplan,
  addMedikamentenEintrag,
  deleteMedikamentenEintrag,
  fetchMedikamente,
} from '@/api/medikamente.js'
import { fetchPatient } from '@/api/patients.js'

const props = defineProps({ patientId: { type: Number, required: true } })
const router = useRouter()
const ui = useUiStore()
const userStore = useUserStore()

// ─── Data ───────────────────────────────────────────────────────────────────
const patient = ref(null)
const eintraege = ref([])
const loading = ref(false)
const katalog = ref([])

// ─── Calendar state ──────────────────────────────────────────────────────────
const ansicht = ref('tag') // 'tag' | 'woche' | 'monat'
const heute = new Date()
heute.setHours(0, 0, 0, 0)
const aktuellesDatum = ref(new Date(heute))

// ─── Add-modal state ────────────────────────────────────────────────────────
const addOpen = ref(false)
const katalogSuche = ref('')
const saving = ref(false)
const form = ref(emptyForm())
const { submitted, invalid, validate, reset } = useFormValidation()
const canSaveForm = computed(() =>
  form.value.medikamentId &&
  form.value.wochentage.length > 0 &&
  form.value.startDatum &&
  form.value.endDatum &&
  form.value.endDatum >= form.value.startDatum
)

function emptyForm() {
  const start = isoDate(new Date())
  const end = isoDate(new Date(Date.now() + 30 * 86400000))
  return {
    medikamentId: null,
    medikamentName: '',
    dosierung: '',
    wochentage: ['MO', 'DI', 'MI', 'DO', 'FR'],
    uhrzeiten: ['08:00'],
    startDatum: start,
    endDatum: end,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const WOCHENTAGE = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO']
const WOCHENTAG_LABELS = { MO: 'Mo', DI: 'Di', MI: 'Mi', DO: 'Do', FR: 'Fr', SA: 'Sa', SO: 'So' }
const EINNAHME_SCHEMA = [
  { label: 'Morgens',   uhr: '08:00' },
  { label: 'Mittags',   uhr: '12:00' },
  { label: 'Abends',    uhr: '18:00' },
  { label: 'Zur Nacht', uhr: '22:00' },
]
const MONAT_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const TAG_NAMES_FULL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

// JS getDay(): 0=So,1=Mo,...,6=Sa → map to our codes
const JS_DAY_TO_CODE = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA']

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function parseIso(s) {
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Returns medication events active on a given date, sorted by time */
function eintraegeFuerTag(date) {
  const code = JS_DAY_TO_CODE[date.getDay()]
  return eintraege.value
    .filter(e => {
      const start = parseIso(e.startDatum)
      const end = parseIso(e.endDatum)
      return date >= start && date <= end && e.wochentage.split(',').includes(code)
    })
    .flatMap(e =>
      e.uhrzeiten.split(',').map(uhr => ({ ...e, uhr: uhr.trim() }))
    )
    .sort((a, b) => a.uhr.localeCompare(b.uhr))
}

/** Returns unique hours that have any event across a set of dates */
function stundenFuerTage(dates) {
  const stunden = new Set()
  dates.forEach(d => eintraegeFuerTag(d).forEach(ev => stunden.add(ev.uhr.split(':')[0].padStart(2, '0'))))
  if (!stunden.size) return []
  const min = Math.min(...[...stunden].map(Number))
  const max = Math.max(...[...stunden].map(Number))
  const result = []
  for (let h = Math.max(0, min - 1); h <= Math.min(23, max + 1); h++) {
    result.push(String(h).padStart(2, '0'))
  }
  return result
}

// ─── Calendar computeds ──────────────────────────────────────────────────────

const tagDaten = computed(() => [new Date(aktuellesDatum.value)])

const wocheDaten = computed(() => {
  const d = new Date(aktuellesDatum.value)
  // Go to Monday of the week
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => addDays(d, i))
})

const monatsDaten = computed(() => {
  const d = new Date(aktuellesDatum.value)
  const year = d.getFullYear(), month = d.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const total = startOffset + lastDay.getDate()
  const weeks = Math.ceil(total / 7)
  const days = []
  for (let i = 0; i < weeks * 7; i++) {
    const dt = addDays(firstDay, i - startOffset)
    days.push({ date: dt, inMonth: dt.getMonth() === month })
  }
  return days
})

const navigationLabel = computed(() => {
  const d = aktuellesDatum.value
  if (ansicht.value === 'tag') {
    const isHeute = sameDay(d, heute)
    return `${TAG_NAMES_FULL[d.getDay()]}, ${d.getDate()}. ${MONAT_NAMES[d.getMonth()]} ${d.getFullYear()}${isHeute ? ' (Heute)' : ''}`
  }
  if (ansicht.value === 'woche') {
    const days = wocheDaten.value
    const from = days[0], to = days[6]
    if (from.getMonth() === to.getMonth()) return `${from.getDate()}. – ${to.getDate()}. ${MONAT_NAMES[from.getMonth()]} ${from.getFullYear()}`
    return `${from.getDate()}. ${MONAT_NAMES[from.getMonth()]} – ${to.getDate()}. ${MONAT_NAMES[to.getMonth()]} ${to.getFullYear()}`
  }
  return `${MONAT_NAMES[d.getMonth()]} ${d.getFullYear()}`
})

// ─── Navigation ──────────────────────────────────────────────────────────────
function navigate(dir) {
  const d = new Date(aktuellesDatum.value)
  if (ansicht.value === 'tag') d.setDate(d.getDate() + dir)
  else if (ansicht.value === 'woche') d.setDate(d.getDate() + dir * 7)
  else d.setMonth(d.getMonth() + dir)
  aktuellesDatum.value = d
}

function goToday() { aktuellesDatum.value = new Date(heute) }

function goToDate(date) {
  aktuellesDatum.value = new Date(date)
  ansicht.value = 'tag'
}

// ─── Load ─────────────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    [patient.value, eintraege.value, katalog.value] = await Promise.all([
      fetchPatient(props.patientId),
      fetchMedikamentenplan(props.patientId),
      fetchMedikamente(),
    ])
  } catch {
    ui.showToast('Fehler beim Laden.', { variant: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ─── Katalog filter ──────────────────────────────────────────────────────────
const katalogGefiltert = computed(() =>
  katalog.value.filter(m =>
    !katalogSuche.value ||
    m.name?.toLowerCase().includes(katalogSuche.value.toLowerCase()) ||
    m.wirkstoff?.toLowerCase().includes(katalogSuche.value.toLowerCase())
  )
)

function waehlemedikament(m) {
  form.value.medikamentId = m.id
  form.value.medikamentName = m.name
  form.value.dosierung = m.dosiereinheit || m.name
  katalogSuche.value = ''
}

// ─── Uhrzeiten ───────────────────────────────────────────────────────────────
function toggleSchema(uhr) {
  const idx = form.value.uhrzeiten.indexOf(uhr)
  if (idx >= 0) {
    if (form.value.uhrzeiten.length > 1) form.value.uhrzeiten.splice(idx, 1)
  } else {
    form.value.uhrzeiten.push(uhr)
    form.value.uhrzeiten.sort()
  }
}

function addUhrzeit() {
  form.value.uhrzeiten.push('12:00')
}

function removeUhrzeit(i) {
  if (form.value.uhrzeiten.length > 1) form.value.uhrzeiten.splice(i, 1)
}

function toggleWochentag(tag) {
  const idx = form.value.wochentage.indexOf(tag)
  if (idx >= 0) {
    if (form.value.wochentage.length > 1) form.value.wochentage.splice(idx, 1)
  } else {
    form.value.wochentage.push(tag)
  }
}

// ─── Save / delete ────────────────────────────────────────────────────────────
function openAdd() {
  form.value = emptyForm()
  katalogSuche.value = ''
  addOpen.value = true
  reset()
}

async function saveAdd() {
  const ok = validate([
    { check: !form.value.medikamentId },
    { check: !form.value.wochentage.length },
    { check: !form.value.startDatum },
    { check: !form.value.endDatum },
    { check: form.value.endDatum < form.value.startDatum },
  ])
  if (!ok) {
    ui.showToast('Bitte alle Pflichtfelder korrekt ausfüllen.', { variant: 'error' })
    return
  }

  saving.value = true
  try {
    await addMedikamentenEintrag(props.patientId, {
      medikament: { id: form.value.medikamentId },
      dosierung: form.value.dosierung.trim(),
      wochentage: form.value.wochentage.join(','),
      uhrzeiten: form.value.uhrzeiten.join(','),
      startDatum: form.value.startDatum,
      endDatum: form.value.endDatum,
    })
    ui.showToast('Medikament verschrieben.', { variant: 'success' })
    addOpen.value = false
    await load()
  } catch (e) {
    ui.showToast(`Fehler beim Speichern: ${e.message}`, { variant: 'error' })
  } finally {
    saving.value = false
  }
}

async function removeEintrag(eintrag) {
  const ok = await ui.confirm({
    title: 'Medikament entfernen',
    message: `${eintrag.medikament.name} aus dem Plan entfernen?`,
    confirmLabel: 'Entfernen',
    cancelLabel: 'Abbrechen',
  })
  if (!ok) return
  try {
    await deleteMedikamentenEintrag(props.patientId, eintrag.id)
    ui.showToast('Medikament entfernt.')
    await load()
  } catch {
    ui.showToast('Fehler beim Entfernen.', { variant: 'error' })
  }
}

// ─── Color palette for entries ────────────────────────────────────────────────
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
const colorMap = computed(() => {
  const map = {}
  eintraege.value.forEach((e, i) => { map[e.id] = COLORS[i % COLORS.length] })
  return map
})

const patientName = computed(() => patient.value ? `${patient.value.vorname} ${patient.value.nachname}` : '')
</script>

<template>
  <AppHeader
    :title="patientName ? `Medikamentenplan – ${patientName}` : 'Medikamentenplan'"
    :show-back="true"
    :back-route="`/patient/view/${patientId}`"
  />

  <main class="mp-main">
    <p v-if="loading" class="state-msg">Lade …</p>

    <div v-else-if="!loading && eintraege.length === 0" class="empty-state">
      <i class="bi bi-capsule" style="font-size:3rem;color:var(--color-primary,#2563eb);opacity:.4"></i>
      <h3>Noch kein Medikamentenplan</h3>
      <p>Hier werden verschriebene Medikamente für diesen Patienten angezeigt.</p>
      <button v-if="!userStore.isPatient" class="btn-add-first" @click="addOpen = true">
        <i class="bi bi-plus-circle"></i> Erstes Medikament hinzufügen
      </button>
    </div>

    <template v-else>
      <!-- ── Toolbar ── -->
      <div class="cal-toolbar">
        <div class="view-switcher">
          <button :class="['view-btn', ansicht === 'tag' && 'active']" @click="ansicht = 'tag'">Tag</button>
          <button :class="['view-btn', ansicht === 'woche' && 'active']" @click="ansicht = 'woche'">Woche</button>
          <button :class="['view-btn', ansicht === 'monat' && 'active']" @click="ansicht = 'monat'">Monat</button>
        </div>

        <div class="nav-row">
          <button class="nav-btn" @click="navigate(-1)" aria-label="Zurück"><i class="bi bi-chevron-left"></i></button>
          <span class="nav-label">{{ navigationLabel }}</span>
          <button class="nav-btn" @click="navigate(1)" aria-label="Weiter"><i class="bi bi-chevron-right"></i></button>
        </div>

        <button class="today-btn" @click="goToday">Heute</button>
      </div>

      <!-- ── TAG-Ansicht ── -->
      <div v-if="ansicht === 'tag'" class="cal-day">
        <template v-if="eintraegeFuerTag(aktuellesDatum).length === 0">
          <div class="no-events">
            <i class="bi bi-calendar2-x"></i>
            <p>Keine Medikamente für diesen Tag.</p>
          </div>
        </template>
        <template v-else>
          <div
            v-for="ev in eintraegeFuerTag(aktuellesDatum)"
            :key="`${ev.id}-${ev.uhr}`"
            class="day-event"
            :style="{ borderColor: colorMap[ev.id], background: colorMap[ev.id] + '18' }"
          >
            <div class="ev-time" :style="{ color: colorMap[ev.id] }">{{ ev.uhr }} Uhr</div>
            <div class="ev-name">{{ ev.medikament.name }}</div>
            <div class="ev-dos">{{ ev.dosierung }}</div>
            <div class="ev-range">
              <i class="bi bi-calendar3"></i>
              {{ ev.startDatum.split('-').reverse().join('.') }} – {{ ev.endDatum.split('-').reverse().join('.') }}
            </div>
          </div>
        </template>
      </div>

      <!-- ── WOCHE-Ansicht ── -->
      <div v-else-if="ansicht === 'woche'" class="cal-week">
        <div
          v-for="tag in wocheDaten"
          :key="tag.toISOString()"
          :class="['week-col', sameDay(tag, heute) && 'is-today', sameDay(tag, aktuellesDatum) && 'is-selected']"
          @click="goToDate(tag)"
        >
          <div class="week-col-head">
            <span class="week-dayname">{{ WOCHENTAG_LABELS[JS_DAY_TO_CODE[tag.getDay()]] }}</span>
            <span class="week-daynum">{{ tag.getDate() }}</span>
          </div>
          <div class="week-events">
            <template v-if="eintraegeFuerTag(tag).length === 0">
              <span class="no-ev-dot">–</span>
            </template>
            <div
              v-for="ev in eintraegeFuerTag(tag)"
              :key="`${ev.id}-${ev.uhr}`"
              class="week-event"
              :style="{ background: colorMap[ev.id] }"
              :title="`${ev.uhr} Uhr – ${ev.medikament.name} ${ev.dosierung}`"
            >
              <span class="we-time">{{ ev.uhr }}</span>
              <span class="we-name">{{ ev.medikament.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── MONAT-Ansicht ── -->
      <div v-else class="cal-month">
        <div class="month-header">
          <div v-for="tag in WOCHENTAGE" :key="tag" class="month-dayname">{{ WOCHENTAG_LABELS[tag] }}</div>
        </div>
        <div class="month-grid">
          <div
            v-for="cell in monatsDaten"
            :key="cell.date.toISOString()"
            :class="['month-cell', !cell.inMonth && 'out-month', sameDay(cell.date, heute) && 'is-today']"
            @click="cell.inMonth && goToDate(cell.date)"
          >
            <span class="month-num">{{ cell.date.getDate() }}</span>
            <div class="month-dots">
              <span
                v-for="ev in eintraegeFuerTag(cell.date).slice(0, 3)"
                :key="`${ev.id}-${ev.uhr}`"
                class="month-dot"
                :style="{ background: colorMap[ev.id] }"
                :title="`${ev.uhr} – ${ev.medikament.name}`"
              ></span>
              <span v-if="eintraegeFuerTag(cell.date).length > 3" class="month-more">+{{ eintraegeFuerTag(cell.date).length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Legende ── -->
      <div v-if="eintraege.length" class="legend">
        <h4 class="legend-title">Aktive Verschreibungen</h4>
        <ul class="legend-list">
          <li v-for="e in eintraege" :key="e.id" class="legend-item">
            <span class="legend-dot" :style="{ background: colorMap[e.id] }"></span>
            <div class="legend-info">
              <span class="legend-name">{{ e.medikament.name }}</span>
              <span class="legend-detail">
                {{ e.dosierung }} · {{ e.wochentage.split(',').map(t => WOCHENTAG_LABELS[t]).join(', ') }} · {{ e.uhrzeiten.split(',').join(', ') }} Uhr
              </span>
              <span class="legend-range">{{ e.startDatum.split('-').reverse().join('.') }} – {{ e.endDatum.split('-').reverse().join('.') }}</span>
            </div>
            <button class="del-btn" @click="removeEintrag(e)" title="Entfernen"><i class="bi bi-trash"></i></button>
          </li>
        </ul>
      </div>

      <!-- ── FAB ── -->
      <button v-if="!userStore.isPatient" class="fab" aria-label="Medikament verschreiben" @click="openAdd">
        <i class="bi bi-plus-lg"></i>
      </button>
    </template>
  </main>

  <!-- ── Add-Modal ── -->
  <Teleport to="body">
    <div v-if="addOpen" class="rx-overlay" @click.self="addOpen = false">
      <div class="rx-modal" role="dialog" aria-modal="true">

        <!-- Header -->
        <div class="rx-head">
          <div>
            <h3 class="rx-title">Medikament verschreiben</h3>
            <p class="rx-subtitle">{{ patientName }}</p>
          </div>
          <button class="rx-close" @click="addOpen = false" aria-label="Schließen"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="rx-body">

          <!-- 1. Medikament -->
          <section class="rx-section">
            <div class="rx-section-head">
              <span class="rx-step">1</span>
              <span class="rx-section-title">Medikament wählen</span>
            </div>
            <div v-if="form.medikamentId" class="rx-selected" @click="form.medikamentId = null; form.medikamentName = ''">
              <i class="bi bi-capsule rx-sel-icon"></i>
              <div class="rx-sel-info">
                <span class="rx-sel-name">{{ form.medikamentName }}</span>
                <span class="rx-sel-wirkstoff">{{ katalog.find(m => m.id === form.medikamentId)?.wirkstoff }}</span>
              </div>
              <span class="rx-sel-change"><i class="bi bi-x-circle"></i></span>
            </div>
            <template v-else>
              <div class="rx-search-wrap">
                <i class="bi bi-search rx-search-icon"></i>
                <input
                  v-model="katalogSuche"
                  type="search"
                  placeholder="Name oder Wirkstoff eingeben …"
                  class="rx-search"
                  autocomplete="off"
                />
              </div>
              <ul v-if="katalogSuche && katalogGefiltert.length" class="rx-results">
                <li
                  v-for="m in katalogGefiltert.slice(0, 20)"
                  :key="m.id"
                  class="rx-result"
                  @click="waehlemedikament(m)"
                >
                  <i class="bi bi-capsule rx-result-icon"></i>
                  <div>
                    <span class="rx-result-name">{{ m.name }}</span>
                    <span class="rx-result-sub">{{ m.wirkstoff }}<template v-if="m.dosiereinheit"> · {{ m.dosiereinheit }}</template></span>
                  </div>
                </li>
                <li v-if="katalogGefiltert.length > 20" class="rx-result rx-result-more">
                  {{ katalogGefiltert.length - 20 }} weitere Treffer — Suche eingrenzen
                </li>
              </ul>
              <p v-else-if="katalogSuche" class="rx-hint"><i class="bi bi-info-circle"></i> Kein Medikament gefunden.</p>
              <p v-else class="rx-hint"><i class="bi bi-search"></i> Suche im Katalog mit {{ katalog.length }} Medikamenten</p>
            </template>
            <span v-if="invalid(!form.medikamentId)" class="rx-error"><i class="bi bi-exclamation-circle"></i> Bitte ein Medikament auswählen</span>
          </section>

          <!-- 2. Einnahme -->
          <section class="rx-section">
            <div class="rx-section-head">
              <span class="rx-step">2</span>
              <span class="rx-section-title">Einnahmeschema</span>
            </div>

            <div class="rx-field">
              <span class="rx-field-label">Wochentage</span>
              <div class="rx-pills">
                <button
                  v-for="tag in WOCHENTAGE"
                  :key="tag"
                  type="button"
                  :class="['rx-pill', form.wochentage.includes(tag) && 'rx-pill-on']"
                  @click="toggleWochentag(tag)"
                >{{ WOCHENTAG_LABELS[tag] }}</button>
              </div>
              <span v-if="invalid(!form.wochentage.length)" class="rx-error"><i class="bi bi-exclamation-circle"></i> Mindestens einen Tag</span>
            </div>

            <div class="rx-field">
              <span class="rx-field-label">Tageszeiten</span>
              <div class="rx-schema-grid">
                <button v-for="s in EINNAHME_SCHEMA" :key="s.label" type="button"
                  :class="['rx-schema-card', form.uhrzeiten.includes(s.uhr) && 'rx-schema-on']"
                  @click="toggleSchema(s.uhr)"
                >
                  <span class="rx-schema-label">{{ s.label }}</span>
                  <span class="rx-schema-time">{{ s.uhr }}</span>
                </button>
              </div>
            </div>
          </section>

          <!-- 3. Zeitraum -->
          <section class="rx-section">
            <div class="rx-section-head">
              <span class="rx-step">3</span>
              <span class="rx-section-title">Zeitraum</span>
            </div>
            <div class="rx-date-row">
              <div class="rx-date-col">
                <span class="rx-field-label">Von</span>
                <input v-model="form.startDatum" type="date" :class="['rx-date-input', { 'rx-input-error': invalid(!form.startDatum) }]" />
              </div>
              <span class="rx-date-sep"><i class="bi bi-arrow-right"></i></span>
              <div class="rx-date-col">
                <span class="rx-field-label">Bis</span>
                <input v-model="form.endDatum" type="date" :class="['rx-date-input', { 'rx-input-error': invalid(!form.endDatum || form.endDatum < form.startDatum) }]" />
              </div>
            </div>
            <span v-if="invalid(form.endDatum < form.startDatum)" class="rx-error"><i class="bi bi-exclamation-circle"></i> Enddatum muss nach Startdatum liegen</span>
          </section>

        </div>

        <!-- Footer -->
        <div class="rx-foot">
          <button class="rx-btn-cancel" @click="addOpen = false" :disabled="saving">Abbrechen</button>
          <button class="rx-btn-submit" @click="saveAdd" :disabled="saving || !canSaveForm">
            <i class="bi bi-check2-circle"></i>
            {{ saving ? 'Wird gespeichert …' : 'Verschreiben' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@import '@/assets/medplan-calendar.css';
</style>

<style scoped>
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.75rem; text-align: center; padding: 4rem 1.5rem;
}
.empty-state h3 { margin: 0; font-size: 1.2rem; color: var(--color-text); }
.empty-state p { margin: 0; color: var(--color-muted); font-size: 0.9rem; }
.btn-add-first {
  margin-top: 0.5rem; padding: 0.6rem 1.4rem;
  background: var(--color-primary, #2563eb); color: #fff;
  border: none; border-radius: 0.5rem; cursor: pointer;
  font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;
}
.btn-add-first:hover { opacity: 0.88; }
.del-btn { background: none; border: none; color: var(--color-muted); cursor: pointer; padding: 0.2rem; font-size: 0.9rem; border-radius: 0.375rem; flex-shrink: 0; }
.del-btn:hover { color: #b3372e; background: #fdf0ef; }

/* ── FAB ── */
.fab {
  position: fixed; bottom: 5rem; right: 1.25rem;
  width: 3.25rem; height: 3.25rem; border-radius: 50%;
  background: var(--color-primary); color: #fff; border: none;
  font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.2);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.fab:hover { filter: brightness(1.08); }

/* ── Verschreibungs-Modal ── */
.rx-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 1rem; }
.rx-modal { background: #fff; border-radius: 1rem; width: 100%; max-width: 32rem; box-shadow: 0 8px 40px rgba(0,0,0,.25); max-height: 90vh; display: flex; flex-direction: column; }
.rx-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem 1rem; }
.rx-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.rx-subtitle { margin: 0.15rem 0 0; font-size: 0.82rem; color: var(--color-muted); }
.rx-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--color-muted); padding: 0.35rem; border-radius: 0.5rem; }
.rx-close:hover { background: var(--color-surface); }

.rx-body { padding: 0 1.5rem 1rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }

/* Sections */
.rx-section { padding: 0.875rem 0; border-bottom: 0.0625rem solid var(--color-border); }
.rx-section:last-child { border-bottom: none; }
.rx-section-head { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.75rem; }
.rx-step { width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--color-primary, #2563eb); color: #fff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rx-section-title { font-size: 0.88rem; font-weight: 700; color: var(--color-text); }

/* Search */
.rx-search-wrap { position: relative; }
.rx-search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-muted); font-size: 0.9rem; pointer-events: none; }
.rx-search { width: 100%; padding: 0.6rem 0.75rem 0.6rem 2.25rem; border: 0.0625rem solid var(--color-border); border-radius: 0.625rem; font-size: 0.9rem; font-family: inherit; background: var(--color-surface, #f8fafc); color: var(--color-text); }
.rx-search:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; background: #fff; }

/* Results */
.rx-results { list-style: none; padding: 0; margin: 0.375rem 0 0; border: 0.0625rem solid var(--color-border); border-radius: 0.625rem; overflow: hidden; max-height: 14rem; overflow-y: auto; }
.rx-result { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.75rem; cursor: pointer; border-bottom: 0.0625rem solid var(--color-border); transition: background 0.1s; }
.rx-result:last-child { border-bottom: none; }
.rx-result:hover { background: #edf4ff; }
.rx-result-icon { color: var(--color-primary); font-size: 1rem; flex-shrink: 0; }
.rx-result-name { font-size: 0.88rem; font-weight: 600; color: var(--color-text); display: block; }
.rx-result-sub { font-size: 0.75rem; color: var(--color-muted); display: block; }
.rx-result-more { justify-content: center; font-size: 0.78rem; color: var(--color-muted); font-style: italic; cursor: default; }
.rx-result-more:hover { background: transparent; }

/* Selected */
.rx-selected { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #edf4ff; border: 0.0625rem solid #93c5fd; border-radius: 0.625rem; cursor: pointer; transition: background 0.12s; }
.rx-selected:hover { background: #dbeafe; }
.rx-sel-icon { font-size: 1.25rem; color: var(--color-primary); flex-shrink: 0; }
.rx-sel-info { flex: 1; min-width: 0; }
.rx-sel-name { font-size: 0.9rem; font-weight: 700; color: #1e40af; display: block; }
.rx-sel-wirkstoff { font-size: 0.78rem; color: #3b82f6; display: block; }
.rx-sel-change { color: #93c5fd; font-size: 1rem; flex-shrink: 0; }
.rx-sel-change:hover { color: #3b82f6; }

.rx-hint { font-size: 0.8rem; color: var(--color-muted); margin: 0.5rem 0 0; display: flex; align-items: center; gap: 0.35rem; }

/* Fields */
.rx-field { margin-top: 0.75rem; }
.rx-field:first-of-type { margin-top: 0; }
.rx-field-label { font-size: 0.78rem; font-weight: 600; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 0.35rem; }

/* Pills (Wochentage) */
.rx-pills { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.rx-pill {
  width: 2.5rem; height: 2.5rem; border-radius: 50%;
  border: 0.125rem solid var(--color-border); background: #fff;
  font-size: 0.78rem; font-weight: 700; font-family: inherit;
  cursor: pointer; color: var(--color-muted);
  transition: all 0.15s;
}
.rx-pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
.rx-pill-on { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* Schema cards (Tageszeiten) */
.rx-schema-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
@media (max-width: 28rem) { .rx-schema-grid { grid-template-columns: repeat(2, 1fr); } }
.rx-schema-card {
  display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
  padding: 0.625rem 0.5rem; border-radius: 0.625rem;
  border: 0.125rem solid var(--color-border); background: #fff;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.rx-schema-card:hover { border-color: var(--color-primary); }
.rx-schema-on { background: var(--color-primary); border-color: var(--color-primary); }
.rx-schema-label { font-size: 0.82rem; font-weight: 600; color: var(--color-text); }
.rx-schema-time { font-size: 0.72rem; color: var(--color-muted); }
.rx-schema-on .rx-schema-label, .rx-schema-on .rx-schema-time { color: #fff; }

/* Dates */
.rx-date-row { display: flex; align-items: flex-end; gap: 0.75rem; flex-wrap: wrap; }
.rx-date-col { flex: 1; min-width: 7rem; }
.rx-date-sep { color: var(--color-muted); margin-bottom: 0.5rem; }
@media (max-width: 28rem) { .rx-date-row { flex-direction: column; align-items: stretch; } .rx-date-sep { display: none; } }
.rx-date-input {
  width: 100%; padding: 0.55rem 0.625rem;
  border: 0.0625rem solid var(--color-border); border-radius: 0.5rem;
  font-size: 0.9rem; font-family: inherit; background: #fff; color: var(--color-text);
}
.rx-date-input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.rx-input-error { border-color: #ef4444 !important; }

/* Error */
.rx-error { font-size: 0.78rem; color: #ef4444; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.35rem; }

/* Footer */
.rx-foot { padding: 1rem 1.5rem; border-top: 0.0625rem solid var(--color-border); display: flex; justify-content: flex-end; gap: 0.5rem; }
.rx-btn-cancel {
  padding: 0.6rem 1.25rem; border-radius: 0.5rem; border: none;
  background: var(--color-surface, #f1f5f9); color: var(--color-text);
  font-size: 0.9rem; font-weight: 600; font-family: inherit; cursor: pointer;
}
.rx-btn-cancel:hover { background: var(--color-border); }
.rx-btn-submit {
  padding: 0.6rem 1.5rem; border-radius: 0.5rem; border: none;
  background: var(--color-primary, #2563eb); color: #fff;
  font-size: 0.9rem; font-weight: 600; font-family: inherit; cursor: pointer;
  display: flex; align-items: center; gap: 0.4rem;
}
.rx-btn-submit:hover:not(:disabled) { filter: brightness(1.08); }
.rx-btn-submit:disabled, .rx-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
