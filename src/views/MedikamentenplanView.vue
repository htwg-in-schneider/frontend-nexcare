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
  form.value.dosierung.trim() &&
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
    { check: !form.value.dosierung.trim() },
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
    <div v-if="addOpen" class="overlay" @click.self="addOpen = false">
      <div class="modal mp-modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>Medikament verschreiben</h3>
          <button class="close-btn" @click="addOpen = false" aria-label="Schließen">✕</button>
        </div>

        <div class="modal-body">

          <!-- Medikament auswählen -->
          <div class="form-section">
            <label class="form-label">Medikament<span class="required-mark">*</span></label>
            <span v-if="invalid(!form.medikamentId)" class="field-error-msg"><i class="bi bi-exclamation-circle"></i> Bitte ein Medikament auswählen</span>
            <div v-if="form.medikamentId" class="selected-med" @click="form.medikamentId = null; form.medikamentName = ''">
              <span class="sel-name">{{ form.medikamentName }}</span>
              <span class="sel-change">ändern ✕</span>
            </div>
            <template v-else>
              <input
                v-model="katalogSuche"
                type="search"
                placeholder="Medikament suchen …"
                class="form-input"
                autocomplete="off"
              />
              <ul v-if="katalogGefiltert.length" class="kat-list">
                <li
                  v-for="m in katalogGefiltert.slice(0, 8)"
                  :key="m.id"
                  class="kat-item"
                  @click="waehlemedikament(m)"
                >
                  <span class="kat-name">{{ m.name }}</span>
                  <span class="kat-wirkstoff">{{ m.wirkstoff }}</span>
                </li>
              </ul>
              <p v-else-if="katalogSuche" class="hint">Kein Medikament gefunden.</p>
              <p v-else class="hint">Tippe um zu suchen …</p>
            </template>
          </div>

          <!-- Dosierung -->
          <div class="form-section">
            <label class="form-label">Dosierung<span class="required-mark">*</span></label>
            <input v-model.trim="form.dosierung" type="text" title="Dosierungsangabe, z.B. 500 mg oder 2 Tabletten (Pflichtfeld, maximal 100 Zeichen)" :class="['form-input', { 'input-error': invalid(!form.dosierung.trim()) }]" placeholder="z.B. 500 mg" maxlength="100" />
            <span v-if="invalid(!form.dosierung.trim())" class="field-error-msg"><i class="bi bi-exclamation-circle"></i> Dosierung ist erforderlich</span>
          </div>

          <!-- Wochentage -->
          <div class="form-section">
            <label class="form-label">Wochentage<span class="required-mark">*</span></label>
            <span v-if="invalid(!form.wochentage.length)" class="field-error-msg"><i class="bi bi-exclamation-circle"></i> Mindestens einen Wochentag auswählen</span>
            <div class="weekday-grid">
              <button
                v-for="tag in WOCHENTAGE"
                :key="tag"
                type="button"
                :class="['wd-btn', form.wochentage.includes(tag) && 'wd-active']"
                @click="toggleWochentag(tag)"
              >{{ WOCHENTAG_LABELS[tag] }}</button>
            </div>
          </div>

          <!-- Uhrzeiten -->
          <div class="form-section">
            <label class="form-label">Uhrzeiten *</label>
            <div class="schema-btns">
              <button v-for="s in EINNAHME_SCHEMA" :key="s.label" type="button"
                :class="['schema-btn', form.uhrzeiten.includes(s.uhr) && 'schema-active']"
                @click="toggleSchema(s.uhr)"
                :title="s.uhr + ' Uhr'"
              >{{ s.label }}</button>
            </div>
            <div class="uhrzeiten-list">
              <div v-for="(_, i) in form.uhrzeiten" :key="i" class="uhrzeit-row">
                <input v-model="form.uhrzeiten[i]" type="time" class="form-input time-input" />
                <button v-if="form.uhrzeiten.length > 1" type="button" class="remove-uhr" @click="removeUhrzeit(i)">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <button type="button" class="add-uhr-btn" @click="addUhrzeit">
              <i class="bi bi-plus"></i> Uhrzeit hinzufügen
            </button>
          </div>

          <!-- Start- und Enddatum -->
          <div class="form-section form-row">
            <div class="form-col">
              <label class="form-label">Startdatum<span class="required-mark">*</span></label>
              <input v-model="form.startDatum" type="date" title="Beginn der Verschreibung (Pflichtfeld)" :class="['form-input', { 'input-error': invalid(!form.startDatum) }]" />
              <span v-if="invalid(!form.startDatum)" class="field-error-msg"><i class="bi bi-exclamation-circle"></i> Pflichtfeld</span>
            </div>
            <div class="form-col">
              <label class="form-label">Enddatum<span class="required-mark">*</span></label>
              <input v-model="form.endDatum" type="date" title="Ende der Verschreibung (Pflichtfeld, muss nach Startdatum liegen)" :class="['form-input', { 'input-error': invalid(!form.endDatum || form.endDatum < form.startDatum) }]" />
              <span v-if="invalid(form.endDatum < form.startDatum)" class="field-error-msg"><i class="bi bi-exclamation-circle"></i> Muss nach Startdatum liegen</span>
            </div>
          </div>

        </div>

        <div class="modal-foot">
          <button class="app-btn app-btn-secondary" @click="addOpen = false" :disabled="saving">Abbrechen</button>
          <button class="app-btn app-btn-primary" @click="saveAdd" :disabled="saving || !canSaveForm">
            {{ saving ? 'Speichern …' : 'Verschreiben' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mp-main { padding: 0 0 6rem; max-width: 56rem; margin: 0 auto; }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }

/* ── Toolbar ── */
.cal-toolbar {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
  align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--color-card);
  border-bottom: 0.0625rem solid var(--color-border);
  position: sticky; top: 0; z-index: 10;
}
.view-switcher { display: flex; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden; border: 0.0625rem solid var(--color-border); }
.view-btn { padding: 0.35rem 0.75rem; border: none; background: none; font-size: 0.82rem; font-family: inherit; cursor: pointer; color: var(--color-muted); }
.view-btn.active { background: var(--color-primary); color: #fff; font-weight: 600; }
.nav-row { display: flex; align-items: center; gap: 0.5rem; }
.nav-btn { width: 2rem; height: 2rem; border-radius: 0.375rem; border: 0.0625rem solid var(--color-border); background: var(--color-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.nav-btn:hover { background: var(--color-card); }
.nav-label { font-size: 0.88rem; font-weight: 600; color: var(--color-text); white-space: nowrap; }
.today-btn { padding: 0.35rem 0.75rem; border-radius: 0.375rem; border: 0.0625rem solid var(--color-border); background: var(--color-surface); font-size: 0.82rem; cursor: pointer; font-family: inherit; }
.today-btn:hover { background: var(--color-card); }

/* ── Tag ── */
.cal-day { padding: 1rem; display: flex; flex-direction: column; gap: 0.625rem; }
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
.no-events { text-align: center; padding: 3rem 1rem; color: var(--color-muted); }
.no-events i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
.day-event {
  border-left: 0.25rem solid; border-radius: 0.625rem;
  padding: 0.75rem 1rem; background: var(--color-card);
}
.ev-time { font-size: 0.82rem; font-weight: 700; margin-bottom: 0.2rem; }
.ev-name { font-size: 0.95rem; font-weight: 600; color: var(--color-text); }
.ev-dos { font-size: 0.82rem; color: var(--color-muted); margin-top: 0.1rem; }
.ev-range { font-size: 0.78rem; color: var(--color-muted); margin-top: 0.35rem; }
.ev-range i { margin-right: 0.2rem; }

/* ── Woche ── */
.cal-week { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 0.0625rem solid var(--color-border); min-height: 14rem; }
.week-col {
  border-right: 0.0625rem solid var(--color-border);
  cursor: pointer; transition: background 0.15s;
  display: flex; flex-direction: column;
}
.week-col:last-child { border-right: none; }
.week-col:hover { background: var(--color-surface); }
.week-col.is-today .week-col-head { background: var(--color-primary); color: #fff; }
.week-col.is-selected { background: var(--color-surface); }
.week-col-head { text-align: center; padding: 0.4rem 0.2rem; border-bottom: 0.0625rem solid var(--color-border); }
.week-dayname { display: block; font-size: 0.7rem; color: var(--color-muted); }
.week-col.is-today .week-dayname { color: rgba(255,255,255,0.8); }
.week-daynum { display: block; font-size: 0.88rem; font-weight: 700; }
.week-events { padding: 0.25rem; display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
.no-ev-dot { text-align: center; color: var(--color-border); font-size: 0.8rem; margin-top: 0.5rem; }
.week-event {
  border-radius: 0.25rem; padding: 0.15rem 0.3rem;
  display: flex; flex-direction: column; gap: 0.05rem;
  overflow: hidden;
}
.we-time { font-size: 0.65rem; color: #fff; opacity: 0.9; }
.we-name { font-size: 0.7rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Monat ── */
.cal-month { border-top: 0.0625rem solid var(--color-border); }
.month-header { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--color-surface); }
.month-dayname { text-align: center; font-size: 0.72rem; font-weight: 600; color: var(--color-muted); padding: 0.4rem 0; }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.month-cell {
  border-right: 0.0625rem solid var(--color-border);
  border-bottom: 0.0625rem solid var(--color-border);
  min-height: 4rem; padding: 0.3rem;
  cursor: pointer; transition: background 0.12s;
}
.month-cell:nth-child(7n) { border-right: none; }
.month-cell:hover { background: var(--color-surface); }
.month-cell.out-month { opacity: 0.35; cursor: default; }
.month-cell.is-today .month-num { background: var(--color-primary); color: #fff; border-radius: 50%; width: 1.4rem; height: 1.4rem; display: flex; align-items: center; justify-content: center; }
.month-num { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
.month-dots { display: flex; flex-wrap: wrap; gap: 0.15rem; margin-top: 0.2rem; }
.month-dot { width: 0.45rem; height: 0.45rem; border-radius: 50%; flex-shrink: 0; }
.month-more { font-size: 0.65rem; color: var(--color-muted); }

/* ── Legende ── */
.legend { padding: 1rem; border-top: 0.0625rem solid var(--color-border); }
.legend-title { font-size: 0.82rem; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
.legend-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.legend-item { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.625rem 0.75rem; background: var(--color-card); border-radius: 0.625rem; border: 0.0625rem solid var(--color-border); }
.legend-dot { width: 0.625rem; height: 0.625rem; border-radius: 50%; flex-shrink: 0; margin-top: 0.35rem; }
.legend-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.legend-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text); }
.legend-detail { font-size: 0.78rem; color: var(--color-muted); }
.legend-range { font-size: 0.75rem; color: var(--color-muted); }
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

/* ── Modal form ── */
.form-section { display: flex; flex-direction: column; gap: 0.35rem; }
.form-label { font-size: 0.82rem; font-weight: 600; color: var(--color-text); }
.form-input {
  padding: 0.5rem 0.75rem;
  border: 0.0625rem solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  color: var(--color-text);
  width: 100%;
}
.form-input:focus { outline: 0.125rem solid var(--color-primary); outline-offset: -0.0625rem; }
.form-row { flex-direction: row; gap: 0.75rem; }
.form-col { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }

/* Katalog-Liste */
.kat-list { list-style: none; padding: 0; margin: 0.25rem 0 0; border: 0.0625rem solid var(--color-border); border-radius: 0.5rem; overflow: hidden; max-height: 12rem; overflow-y: auto; }
.kat-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; cursor: pointer; border-bottom: 0.0625rem solid var(--color-border); gap: 0.5rem; }
.kat-item:last-child { border-bottom: none; }
.kat-item:hover { background: var(--color-surface); }
.kat-name { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
.kat-wirkstoff { font-size: 0.78rem; color: var(--color-muted); }
.hint { font-size: 0.8rem; color: var(--color-muted); margin: 0.25rem 0 0; }
.selected-med {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 0.75rem;
  background: #edf4ff; border: 0.0625rem solid #93c5fd; border-radius: 0.5rem;
  cursor: pointer;
}
.sel-name { font-weight: 600; font-size: 0.9rem; color: #1b4f8a; }
.sel-change { font-size: 0.78rem; color: var(--color-muted); }

/* Wochentage */
.schema-btns { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.schema-btn {
  padding: 0.3rem 0.75rem; border-radius: 2rem; border: 0.0625rem solid var(--color-border);
  background: var(--color-card); color: var(--color-text); font-size: 0.85rem; cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.schema-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.schema-active { background: var(--color-primary) !important; color: #fff !important; border-color: var(--color-primary) !important; }
.weekday-grid { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.wd-btn {
  width: 2.25rem; height: 2.25rem; border-radius: 50%;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-surface);
  font-size: 0.78rem; font-weight: 600; font-family: inherit;
  cursor: pointer; color: var(--color-muted);
}
.wd-btn.wd-active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* Uhrzeiten */
.uhrzeiten-list { display: flex; flex-direction: column; gap: 0.35rem; }
.uhrzeit-row { display: flex; align-items: center; gap: 0.5rem; }
.time-input { flex: 1; }
.remove-uhr { width: 2rem; height: 2rem; border-radius: 0.375rem; border: 0.0625rem solid var(--color-border); background: var(--color-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.remove-uhr:hover { background: #fdf0ef; border-color: #f5c2be; color: #b3372e; }
.add-uhr-btn {
  padding: 0.35rem 0.75rem; border-radius: 0.5rem;
  border: 0.0625rem dashed var(--color-border);
  background: none; font-size: 0.82rem; font-family: inherit;
  cursor: pointer; color: var(--color-primary); align-self: flex-start;
}
.add-uhr-btn:hover { background: var(--color-surface); }
</style>

<style>
.overlay { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,.5) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 99999 !important; padding: 1rem !important; }
.modal { display: block !important; background: #fff !important; border-radius: 1rem !important; width: 100% !important; max-width: 38rem !important; box-shadow: 0 8px 40px rgba(0,0,0,.28) !important; max-height: 90vh !important; overflow-y: auto !important; }
.mp-modal { max-width: 42rem !important; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 1.125rem 1.5rem; border-bottom: 0.0625rem solid var(--color-border); position: sticky; top: 0; background: #fff; z-index: 1; }
.modal-head h3 { margin: 0; font-size: 1rem; }
.modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-foot { padding: 1rem 1.5rem; border-top: 0.0625rem solid var(--color-border); display: flex; justify-content: flex-end; gap: 0.5rem; position: sticky; bottom: 0; background: #fff; }
.close-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--color-muted); padding: 0.25rem; border-radius: 0.375rem; }
.close-btn:hover { background: var(--color-surface); }
</style>
