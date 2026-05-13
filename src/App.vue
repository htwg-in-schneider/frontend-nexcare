<script setup></script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <button class="back-btn" aria-label="Zurück">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h1 class="header-title">Patientenverwaltung</h1>
    </div>
  </header>

  <main class="container px-3">
    <div class="search-wrapper">
      <i class="bi bi-search"></i>
      <input type="text" class="search-input" placeholder="Patient suchen..." />
    </div>

    <ul class="patient-list">
      <li class="patient-card">
        <div class="avatar">MS</div>
        <div class="patient-info">
          <div class="patient-name">Maria Schmidt</div>
          <div class="patient-meta">V-2024-001 · Klinikum Konstanz</div>
        </div>
        <span class="status-badge status-stationaer">Stationär</span>
        <i class="bi bi-chevron-right chevron"></i>
      </li>

      <li class="patient-card">
        <div class="avatar">TW</div>
        <div class="patient-info">
          <div class="patient-name">Thomas Weber</div>
          <div class="patient-meta">V-2024-002 · Klinikum Konstanz</div>
        </div>
        <span class="status-badge status-stationaer">Stationär</span>
        <i class="bi bi-chevron-right chevron"></i>
      </li>

      <li class="patient-card">
        <div class="avatar">AH</div>
        <div class="patient-info">
          <div class="patient-name">Anna Hoffmann</div>
          <div class="patient-meta">V-2024-003 · Klinikum Konstanz</div>
        </div>
        <span class="status-badge status-ambulant">Ambulant</span>
        <i class="bi bi-chevron-right chevron"></i>
      </li>

      <li class="patient-card">
        <div class="avatar">PB</div>
        <div class="patient-info">
          <div class="patient-name">Peter Braun</div>
          <div class="patient-meta">V-2024-004 · Klinikum Konstanz</div>
        </div>
        <span class="status-badge status-stationaer">Stationär</span>
        <i class="bi bi-chevron-right chevron"></i>
      </li>

      <li class="patient-card">
        <div class="avatar">LK</div>
        <div class="patient-info">
          <div class="patient-name">Lisa Krause</div>
          <div class="patient-meta">V-2024-005 · Klinikum Konstanz</div>
        </div>
        <span class="status-badge status-ambulant">Ambulant</span>
        <i class="bi bi-chevron-right chevron"></i>
      </li>
    </ul>
  </main>

  <button class="fab" aria-label="Patient hinzufügen">
    <i class="bi bi-plus-lg"></i>
  </button>

  <nav class="bottom-nav" aria-label="Hauptnavigation">
    <div class="nav-inner">
      <a href="#" class="nav-item">
        <i class="bi bi-house"></i>
        <span>Home</span>
      </a>
      <a href="#" class="nav-item active">
        <i class="bi bi-person-fill"></i>
        <span>Patienten</span>
      </a>
      <a href="#" class="nav-item">
        <i class="bi bi-square"></i>
        <span>Betten</span>
      </a>
      <a href="#" class="nav-item">
        <i class="bi bi-person"></i>
        <span>Account</span>
      </a>
    </div>
  </nav>
</template>

<style scoped></style>
