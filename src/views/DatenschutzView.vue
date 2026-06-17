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

      <h2>1. Verantwortliche Stelle</h2>
      <p>
        NexCare Uniprojekt GmbH<br>
        c/o Hochschule Konstanz – Technik, Wirtschaft und Gestaltung (HTWG)<br>
        Alfred-Wachtel-Straße 8<br>
        78462 Konstanz<br>
        Deutschland<br>
        E-Mail: datenschutz@nexcare.de
      </p>

      <h2>2. Server-Logfiles</h2>
      <p>
        Beim Aufruf unserer Anwendung werden automatisch folgende Daten in Server-Logfiles
        erfasst:
      </p>
      <ul>
        <li>IP-Adresse des anfragenden Systems</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>Browser-Typ und -Version</li>
        <li>Betriebssystem</li>
        <li>Aufgerufene URL</li>
      </ul>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
        an der Sicherstellung des Betriebs und der Sicherheit des Systems).<br>
        <strong>Speicherdauer:</strong> Die Logfiles werden nach spätestens 7 Tagen gelöscht.
        Eine darüberhinausgehende Speicherung erfolgt ausschließlich in anonymisierter Form.
      </p>

      <h2>3. Kontaktformular</h2>
      <p>
        Wenn Sie uns über das Kontaktformular eine Anfrage senden, werden die eingegebenen
        Daten (Name, E-Mail-Adresse, Nachricht) ausschließlich zur Bearbeitung Ihrer Anfrage
        verwendet und nicht an Dritte weitergegeben.<br>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO.<br>
        <strong>Speicherdauer:</strong> Die Daten werden gelöscht, sobald die Anfrage
        abschließend bearbeitet ist.
      </p>

      <h2>4. Cookies</h2>
      <p>
        Diese Anwendung verwendet ausschließlich technisch notwendige Cookies (Session-Cookies)
        für den Betrieb der JWT-Authentifizierung. Diese Cookies werden beim Schließen des
        Browsers automatisch gelöscht. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.<br>
        <strong>Rechtsgrundlage:</strong> § 25 Abs. 2 Nr. 2 TTDSG.
      </p>

      <h2>5. Ihre Rechte</h2>
      <p>
        Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:
      </p>
      <ul>
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung (Art. 17 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
      </ul>
      <p>
        Zur Wahrnehmung Ihrer Rechte wenden Sie sich bitte an:
        <a href="mailto:datenschutz@nexcare.de">datenschutz@nexcare.de</a>
      </p>

      <h2>6. Beschwerderecht bei der Aufsichtsbehörde</h2>
      <p>
        Sie haben das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde,
        wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten
        gegen die DSGVO verstößt (Art. 77 DSGVO).<br><br>
        Die zuständige Aufsichtsbehörde ist der Landesbeauftragte für den Datenschutz
        und die Informationsfreiheit Baden-Württemberg:<br>
        <a href="https://www.baden-wuerttemberg.datenschutz.de/" target="_blank" rel="noopener">
          www.baden-wuerttemberg.datenschutz.de
        </a>
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
