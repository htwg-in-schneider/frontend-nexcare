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
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        NexCare GmbH<br>
        Musterstraße 1<br>
        78462 Konstanz<br>
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: +49 (0) 7531 000000<br>
        E-Mail: info@nexcare.de
      </p>

      <h2>Vertreten durch</h2>
      <p>Prof. Dr. Johannes Schneider (Geschäftsführer)</p>

      <h2>Registereintrag</h2>
      <p>
        Eintragung im Handelsregister.<br>
        Registergericht: Amtsgericht Freiburg<br>
        Registernummer: HRB 123456
      </p>

      <h2>Haftungsausschluss</h2>
      <p>
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
        Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
        können wir jedoch keine Gewähr übernehmen.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
        unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
        Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts
        bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
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
  padding: 0 clamp(1rem, 4%, 2.5rem);
  background: #fff;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  padding-top: 2rem;
  padding-bottom: 2rem;
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
