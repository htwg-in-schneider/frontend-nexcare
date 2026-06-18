<template>
  <main class="info-main">
    <div class="info-card">
      <div class="icon-wrap">
        <i class="bi bi-info-circle-fill"></i>
      </div>
      <h1>Online-Registrierung</h1>
      <p class="subtitle">NexCare Patientenportal</p>
      <p class="body-text">
        Die eigenständige Online-Registrierung für das NexCare-Patientenportal ist in der aktuellen Version
        noch nicht verfügbar.
      </p>
      <p class="body-text">
        Ihr Zugang wird durch das medizinische Fachpersonal eingerichtet.
        Bitte wenden Sie sich bei Fragen direkt an die Aufnahme Ihres Klinikums.
      </p>
      <div class="divider"></div>
      <p class="version-note">NexCare · Version 1.0 · HTWG Konstanz</p>
    </div>
  </main>
</template>

<style scoped>
.info-main {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-bg, #f4f6fb);
}
.info-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 4px 32px rgba(0,0,0,.1);
  padding: 2.5rem 2rem;
  max-width: 28rem;
  width: 100%;
  text-align: center;
}
.icon-wrap {
  width: 4rem; height: 4rem;
  background: #edf4ff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem;
}
.icon-wrap i { font-size: 2rem; color: #2563eb; }
h1 { margin: 0 0 .25rem; font-size: 1.4rem; font-weight: 700; color: #1e293b; }
.subtitle { margin: 0 0 1.25rem; font-size: .85rem; color: #94a3b8; }
.body-text { margin: 0 0 .875rem; font-size: .9rem; color: #475569; line-height: 1.6; }
.divider { border: 0; border-top: 1px solid #e2e8f0; margin: 1.25rem 0; }
.version-note { margin: 0; font-size: .75rem; color: #94a3b8; }
</style>
