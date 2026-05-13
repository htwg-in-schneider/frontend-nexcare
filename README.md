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
