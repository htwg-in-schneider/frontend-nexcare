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
