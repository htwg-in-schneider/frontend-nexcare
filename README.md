# frontend-nexcare

Frontend für die Patientenverwaltung (Vue 3 + Vite).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vetur deaktivieren).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Iterations

### Iteration 1: Static content

- Statisches Mockup der Patientenliste (`patientenviewAlle.png`) als Vue/HTML eingebunden.
- Bootstrap 5 + Bootstrap Icons + Inter-Font via CDN in `index.html`.
- Custom CSS in `src/assets/style.css` für die mockup-nahe Optik (Cards, Avatar-Initialen, Status-Badges, Bottom-Nav, FAB).
- `App.vue` enthält Header, Suchfeld, Patient-Liste (5 Beispielpatienten), FAB und Bottom-Nav.
- Fluid Layout: Alle Größen relativ (`rem`/`em`/`%`), keine `max-width`-Begrenzungen, `auto-fill` Grid für die Patientenliste, sticky Header + sticky Bottom-Nav, App nutzt die volle Höhe via Flex-Layout.

### Iteration 2: GitHub Page deployment

- `.github/workflows/build-and-deploy.yml` deployt die gebaute Vue-App auf GitHub Pages bei jedem Push auf `main` oder `Aufgabe04`.
- `vite.config.js` setzt `base` auf den Repo-Pfad (`/frontend-nexcare/`) im Production-Build, damit Assets korrekt aufgelöst werden.
- Hinweis: Damit das Deployment durchläuft, muss das Repository öffentlich sein und unter Settings → Pages → Source „GitHub Actions" aktiviert werden.

### Iteration 3: Dynamic patient loading from local data

- Lokale `src/data.js` mit Array von 5 Beispielpatienten (inkl. aller Detailfelder für spätere Iterationen).
- `App.vue` rendert die Patientenliste jetzt dynamisch mit `v-for`.
- Klick auf eine Patient-Card löst aktuell einen `alert()` mit Name/Versicherungsnr. aus (Detail-View kommt in Iteration 6).
- Initialen, Statusklasse und Anzeigewerte werden in `<script setup>` aus dem Patientenobjekt abgeleitet.

### Iteration 4: High-Level components

- Vue-Komponenten unter `src/components/`:
  - `PatientCard.vue` (Props: `patient`, Emits: `click`) — Avatar, Name, Meta, Status-Badge, Chevron.
  - `AppHeader.vue` (Props: `title`, `showBack`, Emits: `back`) — Header mit Zurück-Button und Titel.
  - `BottomNav.vue` (Props: `active`) — 4 Tabs, der aktive wird über `active`-Prop gesetzt; nicht implementierte Tabs zeigen einen Hinweis.
  - `SearchBar.vue` (`v-model` Support, `placeholder` Prop) — Suchfeld mit Lupen-Icon.
- `App.vue` ist deutlich schlanker und komponiert die High-Level-Komponenten.

### Iteration 5: Low-Level components

- Wiederverwendbare Low-Level-Komponenten in `src/components/`:
  - `Avatar.vue` (Props: `initials`) — runder Kreis mit Initialen, scoped Styles.
  - `StatusBadge.vue` (Props: `status`) — Pillen-Badge mit Varianten `Stationär`/`Ambulant`.
  - `Button.vue` (Props: `type`, `variant`) — Varianten `primary`/`secondary`, Slot-Inhalt (für die Aktion-Buttons der Detail-View).
  - `BottomNavItem.vue` (Props: `icon`, `label`, `active`, Emits: `click`) — ersetzt die Inline-Items in `BottomNav.vue`.
- Visuelle Styles aus `assets/style.css` in die jeweiligen Komponenten verschoben (scoped). In der globalen CSS bleiben nur noch Layout-Regeln (Grid-Placement etc.).
- `PatientCard.vue` und `BottomNav.vue` nutzen jetzt die neuen Low-Level-Komponenten.

### Iteration 6: Added Vue-Router and patient detail view

- Vue-Router installiert (`npm install vue-router`), in `main.js` registriert.
- `src/router/index.js` mit `createWebHistory(import.meta.env.BASE_URL)` und zwei Routen:
  - `/` → `views/PatientList.vue`
  - `/patient/view/:id` → `views/PatientDetail.vue` (id wird per `props` als `Number` übergeben)
- `App.vue` ist jetzt minimal: `<router-view />` plus globale `BottomNav`.
- `views/PatientList.vue` enthält die Listen-Logik (vorher in `App.vue`), inkl. Header, SearchBar, Patient-Liste, FAB.
- `views/PatientDetail.vue` rendert das Mockup `patientenAnsicht.png`: Hero-Bereich (großer Avatar + Name + Status), Sektionen „Persönliche Daten", „Aktueller Aufenthalt", „Notfallkontakt" als Definition-List, Aktion-Buttons „Medikamentenplan" und „Patient entlassen". Bei unbekannter id wird ein Fallback-Text angezeigt.
- `PatientCard`-Klick navigiert über `router.push({ name: 'patient-detail', params: { id } })`.

### Iteration 7: State management with Pinia

- Pinia installiert (`npm install pinia`), in `main.js` registriert (`createPinia()` + `app.use(pinia)`).
- `src/stores/filter.js`: `useFilterStore()` mit `searchQuery` State und `setSearchQuery`/`reset` Actions.
- `PatientList.vue` nutzt den Store statt eines lokalen Refs: Suchstring überlebt jetzt Navigationen (Liste → Detail → Zurück), und ist bereit für die in Iteration 10 kommende Server-side-Suche.
- `searchQuery` wird über `storeToRefs(filterStore)` an `SearchBar`s `v-model` gebunden.
- Lokales Client-Filtering der Patientenliste nach Name/Versicherungsnr/Klinikum (vor dem REST-Wechsel in Iter 8b).

### Iteration 8a: Dynamic patient loading via REST (dummy data)

- `src/api/patients.js`: zentraler Ort für REST-Aufrufe, mit `fetchPatients()` und `fetchPatient(id)`. Aktuell zeigt `BASE_URL` auf `https://dummyjson.com` — die Felder werden über `mapUserToPatient(...)` auf das Patient-Modell gemappt (V-Nr aus id, Klinikum hardcoded, Status alternierend, fehlende Felder als `–`).
- `views/PatientList.vue`: lädt Patienten in `onMounted` per `fetchPatients()`, zeigt Loading/Error/Empty-States.
- `views/PatientDetail.vue`: lädt einen Patient per `fetchPatient(id)` in `onMounted` und bei Wechsel der `id`-Prop (via `watch`).
- `src/data.js` ist nicht mehr nötig und wurde entfernt.

### Iteration 8b: Dynamic patient loading via REST backend (real data)

- `src/api/patients.js`: `BASE_URL` zeigt jetzt auf `http://localhost:8081` (nexcare-backend); Endpoints sind `/api/patient` und `/api/patient/{id}`.
- Mapping-Helper `mapPatient(p)` adaptiert das Backend-JSON an die im Frontend verwendete Form: `klinikum.name` → flacher `klinikum`-String (zusätzlich `klinikumId`), `status` `"STATIONAER"`/`"AMBULANT"` → `"Stationär"`/`"Ambulant"`, `geburtsdatum` bleibt als ISO im Datenmodell und wird nur in der Anzeige formatiert.
- `PatientList.vue` und `PatientDetail.vue` bleiben strukturell unverändert — alle Anpassungen liegen im API-Layer.
- Voraussetzung: Backend muss auf `:8081` laufen.

### Iteration 9: Complete CRUD of patients via REST

- Neue Komponente `components/PatientForm.vue` (geteilte Form für Create + Edit, `v-model` auf Patient-Objekt, Slot `#actions` für Buttons).
- Neue Views:
  - `views/CreatePatient.vue` (POST `/api/patient`, navigiert nach Erfolg zurück zur Liste).
  - `views/EditPatient.vue` (lädt vorhandenen Patient per `fetchPatient`, PUT `/api/patient/{id}`, plus „Patient entlassen (löschen)"-Button mit `confirm` und DELETE).
- Routen: `/patient/create` und `/patient/edit/:id`.
- Listen-FAB navigiert jetzt zu `patient-create`. PatientDetail-Hero hat einen Stift-Button für „Bearbeiten" (→ `patient-edit`), „Patient entlassen" macht DELETE und navigiert zur Liste.
- API erweitert um `createPatient`, `updatePatient`, `deletePatient` (inkl. Reverse-Mapping `mapToBackend(p)` für Status/Klinikum).
- Klinikum wird vorläufig per ID-Eingabefeld referenziert; in Iteration 11 wird daraus ein Dropdown mit den Klinika aus `/api/klinikum`.

### Iteration 10: Patient Search and Filter

- `components/PatientFilter.vue` — zwei Dropdowns:
  - **Status**: Alle / Stationär / Ambulant.
  - **Klinikum**: „Alle Klinika" + die per `fetchKlinika()` aus `/api/klinikum` geladenen Klinika.
  - „Zurücksetzen"-Button leert alle Filter (inkl. Suchstring).
- `stores/filter.js` erweitert um `statusFilter` und `klinikumFilter`. Pinia hält den Filter-State über Navigationen hinweg.
- `api/patients.js#fetchPatients` hängt `?name=…&status=…&klinikum=…` an die Backend-URL an.
- `api/klinika.js` (neu) — `fetchKlinika()`.
- `PatientList.vue` ruft den Backend-Filter mit 250 ms Debounce auf, sobald sich einer der drei Filter ändert (Such-Tippen führt nicht mehr zu einem Call pro Tastendruck). Lokales Client-Filtering wurde entfernt — das Backend filtert jetzt.

### Iteration 11: Klinikum entity wired into the form

- `PatientForm.vue` lädt jetzt beim Mount die Klinika aus `/api/klinikum` (via `fetchKlinika()` aus `src/api/klinika.js`).
- Das bisherige Number-Input „Klinikum-ID" ist ersetzt durch ein `<select>`-Dropdown mit allen Klinika (Anzeige: `klinikum.name`, Wert: `klinikum.id`).
- `mapToBackend(p)` aus `api/patients.js` setzt `klinikum: { id: Number(klinikumId) }` für POST/PUT — Backend speichert die Referenz, und `mapPatient(p)` macht beim Laden wieder einen flachen String draus.
- Damit ist die 1:n-Beziehung Klinikum ↔ Patienten auch im Create/Edit-Formular sauber umgesetzt.

### Iteration 9 (fix): Custom Toast + Confirm-Dialog

- Browser-eigene `alert()`/`confirm()` ersetzt durch eigene UI-Komponenten:
  - `components/Toast.vue` — Pop-up mittig oben (1/4 vom oberen Rand), verschwindet automatisch nach 3 Sekunden, Varianten `success`/`error`/`info` mit passendem Icon und farbigem Border.
  - `components/ConfirmDialog.vue` — Modaler Dialog mit Overlay, Titel, Nachricht, „Abbrechen"/„Bestätigen"-Buttons; gibt ein Promise zurück.
- `stores/ui.js`: zentraler Pinia-Store mit `showToast(message, opts)` und `confirm({ title, message, confirmLabel, cancelLabel })`-Action (Promise-basiert).
- `App.vue` mountet `<Toast />` und `<ConfirmDialog />` global.
- Alle bisherigen `alert(...)` und `confirm(...)` in den Views/Komponenten umgestellt.
