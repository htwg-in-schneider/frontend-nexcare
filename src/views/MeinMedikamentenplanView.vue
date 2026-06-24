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

<style>
@import '@/assets/medplan-calendar.css';
</style>
