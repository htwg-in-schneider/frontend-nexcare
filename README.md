# NexCare – Patientenverwaltung (Frontend)

Vue 3 + Vite + Pinia + Vue Router · Auth0 (OAuth2/JWT) · GitHub Pages

## Live-Demo

| Komponente | URL |
|------------|-----|
| **Frontend** | https://htwg-in-schneider.github.io/frontend-nexcare/ |
| **Backend** | gehostet auf render.com (Free Tier) |

> **Hinweis:** Das Backend befindet sich im Free-Tier von render.com und geht nach Inaktivität in den Standby-Modus. Beim ersten Login kann der Start **bis zu 60 Sekunden** dauern. Das Frontend zeigt in dieser Zeit einen Ladebildschirm mit dem Hinweis „Server wird gestartet …".

## Demo-Zugänge

| Rolle | E-Mail | Passwort | Beschreibung |
|-------|--------|----------|--------------|
| **Arzt** | arzt@nexcare.com | arzt2026! | Kann Patienten aufnehmen, entlassen, Medikamente verschreiben, Betten zuweisen |
| **Pflegekraft** | pflege@nexcare.com | arzt2026! | Gleiche Rechte wie Arzt (außer Admin-Bereich) |
| **Patient** | patient@nexcare.com | arzt2026! | Sieht eigenes Portal mit Medikamentenplan, Zimmerdaten, Nachrichten |
| **Admin** | admin@nexcare.com | arzt2026! | Alle Rechte + Klinika-, Benutzer- und Medikamentenverwaltung |

### Patienten-Login testen

Der Patienten-Account (`patient@nexcare.com`) ist die Demo-Patientin **Maria Schmidt**. Nach dem Login landet man direkt im **Patientenportal**, das folgende Funktionen bietet:

- Persönliche Daten und aktuelles Zimmer/Bett einsehen
- Heutiger Medikamentenplan mit nächster Einnahme
- Benachrichtigungen vom Klinikpersonal (z.B. Bettzuweisung, neue Verschreibung)
- Eigenanteil berechnen und (simuliert) bezahlen
- Aufnahmeantrag stellen
- Kontaktformular (öffnet E-Mail-Programm)

### Staff-Login testen (Arzt/Pflegekraft)

Nach dem Login als Arzt oder Pflegekraft gelangt man zum **Dashboard** mit:

- **Patientenliste** — Suche und Filter nach Name, Status, Klinikum
- **Patientendetail** — Alle Daten, Entlassen-Button, Medikamentenplan-Link
- **Bettenverwaltung** — Klinikum-Struktur (Etagen → Zimmer → Betten), Drag-and-Drop-Zuweisung
- **Medikamentenplan** — Kalenderansicht (Tag/Woche/Monat), Medikamente aus dem Katalog verschreiben
- **Aufnahmeanträge** — Vom Patienten gestellte Anträge prüfen und bestätigen
- **Patientenaufnahme** — Mehrstufiger Aufnahme-Wizard (3 Schritte)

### Admin-Login testen

Der Admin hat zusätzlich Zugriff auf:

- **Klinika-Verwaltung** — Kliniken anlegen, bearbeiten, löschen
- **Benutzerverwaltung** — Alle registrierten Benutzer und Rollen einsehen
- **Medikamentenverwaltung** — Medikamentenkatalog pflegen (200+ Stammdaten)

## Architektur

```
┌──────────────────────┐      ┌──────────────────────┐
│   Vue 3 Frontend     │◄────►│  Spring Boot Backend │
│   (GitHub Pages)     │ REST │  (render.com)        │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           │  OAuth2/JWT                 │  JPA/Hibernate
           ▼                             ▼
    ┌─────────────┐              ┌──────────────┐
    │   Auth0     │              │  MariaDB     │
    │   (IdP)     │              │  (render.com)│
    └─────────────┘              └──────────────┘
```

### Rollen-System

| Rolle | Zugriff |
|-------|---------|
| `PATIENT` | Eigenes Portal, eigener Medikamentenplan, Eigenanteil, Kontaktformular |
| `KRANKENSCHWESTER` | Alle Patienten, Betten, Medikamentenpläne, Aufnahmeanträge |
| `ARZT` | Gleich wie Pflegekraft |
| `ADMIN` | Alles + Klinika-, Benutzer-, Medikamentenverwaltung |

Die Rollentrennung wird sowohl im Frontend (Vue Router Guards) als auch im Backend (Spring Security + JWT) durchgesetzt. Ein Patient kann keine Staff-Routen aufrufen und umgekehrt.

## Lokal starten

### Voraussetzungen

- Node.js 20+
- Java 21 + Maven

### Backend

```sh
cd backend-nexcare
mvn spring-boot:run
```

Startet auf `http://localhost:8081` mit eingebetteter H2-Datenbank. Beim ersten Start werden automatisch Demo-Daten geladen (Patienten, Klinika, Medikamentenkatalog).

### Frontend

```sh
cd frontend-nexcare
npm install
npm run dev
```

Startet auf `http://localhost:5173`. Die `.env.local` muss die Auth0-Konfiguration enthalten:

```
VITE_AUTH0_DOMAIN=dev-m7r3to5keud2gw65.us.auth0.com
VITE_AUTH0_CLIENT_ID=<Client-ID aus Auth0>
VITE_AUTH0_AUDIENCE=https://nexcare.api
VITE_API_BASE_URL=http://localhost:8081
```

## Technologie-Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | Vue 3, Vite, Pinia, Vue Router, Bootstrap Icons |
| Backend | Spring Boot 3.5, Spring Security, okta-spring-boot-starter |
| Auth | Auth0 (OAuth 2.0 / JWT) |
| Datenbank | H2 (lokal), MariaDB (Produktion) |
| Deployment | GitHub Pages (Frontend), render.com (Backend) |
| CI/CD | GitHub Actions (automatischer Build + Deploy bei Push) |
