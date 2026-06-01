<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="nx-legal-page">
    <div class="nx-legal-inner">
      <button class="nx-back-btn" @click="router.back()">
        <i class="bi bi-arrow-left"></i> Zurück
      </button>
      <h1>Datenschutzerklärung</h1>

      <h2>1. Datenschutz auf einen Blick</h2>
      <p>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
        personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.
      </p>

      <h2>2. Verantwortliche Stelle</h2>
      <p>
        NexCare GmbH<br>
        Musterstraße 1<br>
        78462 Konstanz<br>
        E-Mail: datenschutz@nexcare.de
      </p>

      <h2>3. Datenerfassung auf unserer Website</h2>
      <p>
        Beim Besuch unserer Website werden automatisch technisch notwendige Daten
        (Server-Logfiles) erfasst. Dazu zählen: IP-Adresse, Datum und Uhrzeit der
        Anfrage, Browser-Typ und -Version sowie das Betriebssystem.
      </p>

      <h2>4. Kontaktformular</h2>
      <p>
        Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
        aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten
        verarbeitet. Die Daten werden ausschließlich für die Bearbeitung Ihrer Anfrage
        verwendet (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2>5. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung
        der Verarbeitung Ihrer personenbezogenen Daten sowie das Recht auf
        Datenübertragbarkeit. Wenden Sie sich dazu an datenschutz@nexcare.de.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Diese Anwendung verwendet technisch notwendige Cookies (Session-Cookies) für
        den Betrieb der Authentifizierung. Es werden keine Tracking- oder Werbe-Cookies
        eingesetzt.
      </p>
    </div>
  </div>
</template>

<style scoped>
.nx-legal-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 3rem 0;
}
.nx-legal-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem clamp(1rem, 4%, 2.5rem);
  background: #fff;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}
.nx-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
}
.nx-back-btn:hover { text-decoration: underline; }
h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 2rem;
  color: var(--color-text);
}
h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 1.75rem 0 0.5rem;
  color: var(--color-text);
}
p {
  color: var(--color-muted);
  line-height: 1.7;
  margin: 0;
}
</style>
