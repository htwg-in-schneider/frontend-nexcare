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
