<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useUserStore } from '@/stores/user.js'
import { fetchMedikamentenplan } from '@/api/medikamente.js'
import { fetchMeinPatient } from '@/api/profile.js'

const router = useRouter()
const userStore = useUserStore()

const patientId = ref(null)
const eintraege = ref([])
const loading = ref(true)

const ansicht = ref('tag')
const heute = new Date()
heute.setHours(0, 0, 0, 0)
const aktuellesDatum = ref(new Date(heute))

const WOCHENTAGE = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO']
const WOCHENTAG_LABELS = { MO: 'Mo', DI: 'Di', MI: 'Mi', DO: 'Do', FR: 'Fr', SA: 'Sa', SO: 'So' }
const MONAT_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const TAG_NAMES_FULL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const JS_DAY_TO_CODE = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA']

function parseIso(s) {
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d); dt.setHours(0, 0, 0, 0); return dt
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }

function eintraegeFuerTag(date) {
  const code = JS_DAY_TO_CODE[date.getDay()]
  return eintraege.value
    .filter(e => {
      const start = parseIso(e.startDatum), end = parseIso(e.endDatum)
      return date >= start && date <= end && e.wochentage.split(',').includes(code)
    })
    .flatMap(e => e.uhrzeiten.split(',').map(uhr => ({ ...e, uhr: uhr.trim() })))
    .sort((a, b) => a.uhr.localeCompare(b.uhr))
}

const wocheDaten = computed(() => {
  const d = new Date(aktuellesDatum.value)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => addDays(d, i))
})

const monatsDaten = computed(() => {
  const d = new Date(aktuellesDatum.value)
  const year = d.getFullYear(), month = d.getMonth()
  const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const total = startOffset + lastDay.getDate()
  const weeks = Math.ceil(total / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const dt = addDays(firstDay, i - startOffset)
    return { date: dt, inMonth: dt.getMonth() === month }
  })
})

const navigationLabel = computed(() => {
  const d = aktuellesDatum.value
  if (ansicht.value === 'tag') {
    const isHeute = sameDay(d, heute)
    return `${TAG_NAMES_FULL[d.getDay()]}, ${d.getDate()}. ${MONAT_NAMES[d.getMonth()]} ${d.getFullYear()}${isHeute ? ' (Heute)' : ''}`
  }
  if (ansicht.value === 'woche') {
    const days = wocheDaten.value, from = days[0], to = days[6]
    if (from.getMonth() === to.getMonth()) return `${from.getDate()}. – ${to.getDate()}. ${MONAT_NAMES[from.getMonth()]} ${from.getFullYear()}`
    return `${from.getDate()}. ${MONAT_NAMES[from.getMonth()]} – ${to.getDate()}. ${MONAT_NAMES[to.getMonth()]} ${to.getFullYear()}`
  }
  return `${MONAT_NAMES[d.getMonth()]} ${d.getFullYear()}`
})

function navigate(dir) {
  const d = new Date(aktuellesDatum.value)
  if (ansicht.value === 'tag') d.setDate(d.getDate() + dir)
  else if (ansicht.value === 'woche') d.setDate(d.getDate() + dir * 7)
  else d.setMonth(d.getMonth() + dir)
  aktuellesDatum.value = d
}
function goToday() { aktuellesDatum.value = new Date(heute) }
function goToDate(date) { aktuellesDatum.value = new Date(date); ansicht.value = 'tag' }

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
const colorMap = computed(() => {
  const map = {}
  eintraege.value.forEach((e, i) => { map[e.id] = COLORS[i % COLORS.length] })
  return map
})

async function load() {
  loading.value = true
  try {
    const p = await fetchMeinPatient()
    patientId.value = p.id
    eintraege.value = await fetchMedikamentenplan(p.id)
  } catch {
    eintraege.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppHeader title="Mein Medikamentenplan" :show-back="true" back-route="/portal" />

  <main class="mp-main">
    <p v-if="loading" class="state-msg">Lade …</p>

    <template v-else>
      <div class="cal-toolbar">
        <div class="view-switcher">
          <button :class="['view-btn', ansicht === 'tag' && 'active']" @click="ansicht = 'tag'">Tag</button>
          <button :class="['view-btn', ansicht === 'woche' && 'active']" @click="ansicht = 'woche'">Woche</button>
          <button :class="['view-btn', ansicht === 'monat' && 'active']" @click="ansicht = 'monat'">Monat</button>
        </div>
        <div class="nav-row">
          <button class="nav-btn" @click="navigate(-1)"><i class="bi bi-chevron-left"></i></button>
          <span class="nav-label">{{ navigationLabel }}</span>
          <button class="nav-btn" @click="navigate(1)"><i class="bi bi-chevron-right"></i></button>
        </div>
        <button class="today-btn" @click="goToday">Heute</button>
      </div>

      <!-- Tag -->
      <div v-if="ansicht === 'tag'" class="cal-day">
        <div v-if="!eintraegeFuerTag(aktuellesDatum).length" class="no-events">
          <i class="bi bi-calendar2-check"></i>
          <p>Heute keine Einnahmen geplant.</p>
        </div>
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
      </div>

      <!-- Woche -->
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
            <span v-if="!eintraegeFuerTag(tag).length" class="no-ev-dot">–</span>
            <div
              v-for="ev in eintraegeFuerTag(tag)"
              :key="`${ev.id}-${ev.uhr}`"
              class="week-event"
              :style="{ background: colorMap[ev.id] }"
              :title="`${ev.uhr} – ${ev.medikament.name}`"
            >
              <span class="we-time">{{ ev.uhr }}</span>
              <span class="we-name">{{ ev.medikament.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monat -->
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
              ></span>
              <span v-if="eintraegeFuerTag(cell.date).length > 3" class="month-more">+{{ eintraegeFuerTag(cell.date).length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legende -->
      <div v-if="eintraege.length" class="legend">
        <h4 class="legend-title">Meine Verschreibungen</h4>
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
          </li>
        </ul>
      </div>
      <div v-else class="no-events" style="padding: 3rem 0;">
        <i class="bi bi-capsule"></i>
        <p>Keine Medikamente verschrieben.</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
.mp-main { padding: 0 0 6rem; max-width: 56rem; margin: 0 auto; }
.state-msg { text-align: center; color: var(--color-muted); margin-top: 2rem; }
.cal-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--color-card); border-bottom: 0.0625rem solid var(--color-border); position: sticky; top: 0; z-index: 10; }
.view-switcher { display: flex; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden; border: 0.0625rem solid var(--color-border); }
.view-btn { padding: 0.35rem 0.75rem; border: none; background: none; font-size: 0.82rem; font-family: inherit; cursor: pointer; color: var(--color-muted); }
.view-btn.active { background: var(--color-primary); color: #fff; font-weight: 600; }
.nav-row { display: flex; align-items: center; gap: 0.5rem; }
.nav-btn { width: 2rem; height: 2rem; border-radius: 0.375rem; border: 0.0625rem solid var(--color-border); background: var(--color-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.nav-label { font-size: 0.88rem; font-weight: 600; color: var(--color-text); white-space: nowrap; }
.today-btn { padding: 0.35rem 0.75rem; border-radius: 0.375rem; border: 0.0625rem solid var(--color-border); background: var(--color-surface); font-size: 0.82rem; cursor: pointer; font-family: inherit; }
.cal-day { padding: 1rem; display: flex; flex-direction: column; gap: 0.625rem; }
.no-events { text-align: center; padding: 3rem 1rem; color: var(--color-muted); }
.no-events i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
.day-event { border-left: 0.25rem solid; border-radius: 0.625rem; padding: 0.75rem 1rem; background: var(--color-card); }
.ev-time { font-size: 0.82rem; font-weight: 700; margin-bottom: 0.2rem; }
.ev-name { font-size: 0.95rem; font-weight: 600; color: var(--color-text); }
.ev-dos { font-size: 0.82rem; color: var(--color-muted); margin-top: 0.1rem; }
.ev-range { font-size: 0.78rem; color: var(--color-muted); margin-top: 0.35rem; }
.ev-range i { margin-right: 0.2rem; }
.cal-week { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 0.0625rem solid var(--color-border); min-height: 14rem; }
.week-col { border-right: 0.0625rem solid var(--color-border); cursor: pointer; display: flex; flex-direction: column; }
.week-col:last-child { border-right: none; }
.week-col:hover { background: var(--color-surface); }
.week-col.is-today .week-col-head { background: var(--color-primary); color: #fff; }
.week-col-head { text-align: center; padding: 0.4rem 0.2rem; border-bottom: 0.0625rem solid var(--color-border); }
.week-dayname { display: block; font-size: 0.7rem; color: var(--color-muted); }
.week-col.is-today .week-dayname { color: rgba(255,255,255,0.8); }
.week-daynum { display: block; font-size: 0.88rem; font-weight: 700; }
.week-events { padding: 0.25rem; display: flex; flex-direction: column; gap: 0.15rem; }
.no-ev-dot { text-align: center; color: var(--color-border); font-size: 0.8rem; margin-top: 0.5rem; }
.week-event { border-radius: 0.25rem; padding: 0.15rem 0.3rem; display: flex; flex-direction: column; overflow: hidden; }
.we-time { font-size: 0.65rem; color: #fff; opacity: 0.9; }
.we-name { font-size: 0.7rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cal-month { border-top: 0.0625rem solid var(--color-border); }
.month-header { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--color-surface); }
.month-dayname { text-align: center; font-size: 0.72rem; font-weight: 600; color: var(--color-muted); padding: 0.4rem 0; }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.month-cell { border-right: 0.0625rem solid var(--color-border); border-bottom: 0.0625rem solid var(--color-border); min-height: 4rem; padding: 0.3rem; cursor: pointer; }
.month-cell:nth-child(7n) { border-right: none; }
.month-cell:hover { background: var(--color-surface); }
.month-cell.out-month { opacity: 0.35; cursor: default; }
.month-cell.is-today .month-num { background: var(--color-primary); color: #fff; border-radius: 50%; width: 1.4rem; height: 1.4rem; display: flex; align-items: center; justify-content: center; }
.month-num { font-size: 0.8rem; font-weight: 600; }
.month-dots { display: flex; flex-wrap: wrap; gap: 0.15rem; margin-top: 0.2rem; }
.month-dot { width: 0.45rem; height: 0.45rem; border-radius: 50%; }
.month-more { font-size: 0.65rem; color: var(--color-muted); }
.legend { padding: 1rem; border-top: 0.0625rem solid var(--color-border); }
.legend-title { font-size: 0.82rem; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
.legend-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.legend-item { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.625rem 0.75rem; background: var(--color-card); border-radius: 0.625rem; border: 0.0625rem solid var(--color-border); }
.legend-dot { width: 0.625rem; height: 0.625rem; border-radius: 50%; flex-shrink: 0; margin-top: 0.35rem; }
.legend-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.legend-name { font-size: 0.9rem; font-weight: 600; }
.legend-detail { font-size: 0.78rem; color: var(--color-muted); }
.legend-range { font-size: 0.75rem; color: var(--color-muted); }
</style>
