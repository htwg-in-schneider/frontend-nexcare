<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const mobileOpen = ref(false);

// Kontakt-Modal
const contactOpen = ref(false);
const contact = ref({ name: '', email: '', message: '' });

function openContact() {
  contactOpen.value = true;
  mobileOpen.value = false;
}
function closeContact() {
  contactOpen.value = false;
}
function sendContact() {
  const subject = encodeURIComponent('NexCare Demo-Anfrage von ' + contact.value.name);
  const body = encodeURIComponent(
    `Name: ${contact.value.name}\nE-Mail: ${contact.value.email}\n\n${contact.value.message}`
  );
  window.location.href = `mailto:info@nexcare.de?subject=${subject}&body=${body}`;
  closeContact();
}

// Karriere-Modal
const karriereOpen = ref(false);
const karriere = ref({ name: '', email: '', position: '', message: '' });

function openKarriere() {
  karriereOpen.value = true;
  mobileOpen.value = false;
}
function closeKarriere() {
  karriereOpen.value = false;
}
function sendKarriere() {
  const subject = encodeURIComponent('NexCare Initiativbewerbung von ' + karriere.value.name);
  const body = encodeURIComponent(
    `Name: ${karriere.value.name}\nE-Mail: ${karriere.value.email}\nGewünschte Stelle: ${karriere.value.position}\n\n${karriere.value.message}`
  );
  window.location.href = `mailto:karriere@nexcare.de?subject=${subject}&body=${body}`;
  closeKarriere();
}
function scrollTo(id) {
  mobileOpen.value = false;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
</script>

<template>
  <!-- TOP BAR -->
  <header class="topbar">
    <div class="container nav">
      <a class="brand" href="#" @click.prevent="scrollTo('hero')">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="white" stroke-width="2.6" stroke-linecap="round"/></svg>
        </span>
        NexCare
      </a>
      <nav>
        <ul>
          <li><a href="#" @click.prevent="scrollTo('features')">Plattform</a></li>
          <li><a href="#" @click.prevent="scrollTo('module')">Module</a></li>
          <li><a href="#" @click.prevent="scrollTo('rollen')">Rollen</a></li>
          <li><a href="#" @click.prevent="scrollTo('sicherheit')">Medikation</a></li>
          <li><a href="#" @click.prevent="openContact()">Kontakt</a></li>
        </ul>
      </nav>
      <div class="actions">
        <a class="btn btn-ghost" @click.prevent="router.push('/patients')">Anmelden</a>
        <a class="btn btn-primary" @click.prevent="openContact()">Demo anfragen</a>
        <button class="burger" aria-label="Menü" @click="mobileOpen = !mobileOpen">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
    <div id="mm" class="mobile-menu" :class="{ open: mobileOpen }">
      <a href="#" @click.prevent="scrollTo('features')">Plattform</a>
      <a href="#" @click.prevent="scrollTo('module')">Module</a>
      <a href="#" @click.prevent="scrollTo('rollen')">Rollen</a>
      <a href="#" @click.prevent="scrollTo('sicherheit')">Medikation</a>
      <a href="#" @click.prevent="openContact()">Kontakt</a>
      <a href="#" @click.prevent="router.push('/patients')">Anmelden</a>
    </div>
  </header>

  <!-- HERO -->
  <section id="hero" class="hero">
    <div class="hero-bg"></div>
    <div class="grid-overlay"></div>
    <div class="container hero-inner">
      <div>
        <h1 class="headline">
          Ein Krankenhaus&shy;informations&shy;system
          <span class="serif">für den klinischen Alltag.</span>
        </h1>
        <p class="lede">
          NexCare verbindet Patientenverwaltung, Bettenmanagement, Medikamentenplan mit
          Wechselwirkungs­prüfung und rollenbasierte Benutzerverwaltung in einer Anwendung.
        </p>
        <div class="cta-row">
          <a class="btn btn-primary btn-lg" href="#" @click.prevent="openContact()">
            Live-Demo vereinbaren
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a class="btn btn-ghost btn-lg" href="#" @click.prevent="scrollTo('features')">Plattform entdecken</a>
        </div>
        <div class="trust">
          <span>
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Rollenbasierte Zugriffe
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            JWT-Authentifizierung
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Spring Boot + Vue.js
          </span>
        </div>
      </div>

      <!-- Dashboard Mock -->
      <div class="mock" aria-hidden="true">
        <div class="mock-bar">
          <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
          <span class="crumbs">NexCare · Dashboard</span>
        </div>
        <div class="dash">
          <h4>Guten Tag, User</h4>
          <p class="sub2">Übersicht und Schnellzugriff</p>
          <div class="dash-grid">
            <div class="dcard">
              <div class="icn">
                <svg viewBox="0 0 28 28" fill="currentColor"><rect x="2" y="14" width="24" height="9" rx="3"/><rect x="5" y="7" width="9" height="7" rx="2"/><rect x="2" y="23" width="3" height="3" rx="1.5"/><rect x="23" y="23" width="3" height="3" rx="1.5"/></svg>
              </div>
              <span class="lbl">Bettenverwaltung</span>
              <span class="open">Öffnen ›</span>
            </div>
            <div class="dcard">
              <div class="icn">
                <svg viewBox="0 0 28 28" fill="currentColor"><rect x="9" y="2" width="10" height="24" rx="5"/><rect x="2" y="9" width="24" height="10" rx="5"/></svg>
              </div>
              <span class="lbl">Medikamentenplan</span>
              <span class="open">Öffnen ›</span>
            </div>
            <div class="dcard">
              <div class="icn">
                <svg viewBox="0 0 28 28" fill="currentColor"><circle cx="14" cy="11" r="7"/><rect x="9" y="20" width="10" height="3" rx="1.5"/><rect x="7" y="24" width="14" height="2" rx="1"/></svg>
              </div>
              <span class="lbl">Medikamentenverwaltung</span>
              <span class="open">Öffnen ›</span>
            </div>
            <div class="dcard">
              <div class="icn">
                <svg viewBox="0 0 28 28" fill="currentColor"><circle cx="14" cy="9" r="5"/><path d="M3 26c0-6.1 4.9-11 11-11s11 4.9 11 11H3z"/></svg>
              </div>
              <span class="lbl">Patientenportal</span>
              <span class="open">Öffnen ›</span>
            </div>
            <div class="dcard">
              <div class="icn">
                <svg viewBox="0 0 28 28" fill="currentColor"><circle cx="14" cy="9" r="5"/><path d="M3 26c0-6.1 4.9-11 11-11s11 4.9 11 11H3z" opacity=".55"/></svg>
              </div>
              <span class="lbl">Patientenverwaltung</span>
              <span class="open">Öffnen ›</span>
            </div>
            <div class="dcard">
              <div class="icn">
                <svg viewBox="0 0 28 28" fill="currentColor"><path d="M14 2l3.5 7.2 8 1.2-5.8 5.6 1.4 7.9L14 20.3l-7.1 3.6 1.4-7.9L2.5 10.4l8-1.2z"/></svg>
              </div>
              <span class="lbl">Wechselwirkungen</span>
              <span class="open">Öffnen ›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Module</span>
        <h2 class="h2">Die Funktionen von NexCare.</h2>
        <p class="sub">Alle Module, die aktuell in NexCare enthalten sind.</p>
      </div>
      <div class="features">
        <div class="card">
          <div class="ico"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="white" stroke-width="1.8"/><path d="M5 20c1.5-3.6 4.2-5.4 7-5.4S17.5 16.4 19 20" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg></div>
          <h3>Patientenverwaltung</h3>
          <p>Aufnahme, Stammdaten und Status von Patienten inklusive Zuordnung zu Zimmer und Bett.</p>
        </div>
        <div class="card">
          <div class="ico teal"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="11" rx="2" stroke="white" stroke-width="1.8"/><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="white" stroke-width="1.8"/></svg></div>
          <h3>Bettenverwaltung</h3>
          <p>Hierarchisch von Krankenhaus über Etage, Abteilung und Station bis zum einzelnen Zimmer und Bett.</p>
        </div>
        <div class="card">
          <div class="ico green"><svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6v4h-6zM7 7h10l1 13H6z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 11v6M9 14h6" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg></div>
          <h3>Medikamentenverwaltung</h3>
          <p>Stammkatalog aller Medikamente mit Name, Wirkstoff, Beschreibung und Dosiereinheit, inklusive Archivierung.</p>
        </div>
        <div class="card">
          <div class="ico"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="16" rx="2" stroke="white" stroke-width="1.8"/><path d="M8 3v4M16 3v4M4 11h16M9 15h6M9 18h4" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg></div>
          <h3>Medikamentenplan</h3>
          <p>Individueller Medikamentenplan pro Patient mit Wirkstoffsuche im Stammkatalog.</p>
        </div>
        <div class="card">
          <div class="ico red"><svg viewBox="0 0 24 24" fill="none"><path d="M13 3L4 14h7l-1 7 9-11h-7z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/></svg></div>
          <h3>Wechselwirkungen</h3>
          <p>Prüfung auf bekannte Wechselwirkungen der aktuell verordneten Medikamente eines Patienten.</p>
        </div>
        <div class="card">
          <div class="ico amber"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="3.2" stroke="white" stroke-width="1.8"/><path d="M4 20c1.5-3.6 4.6-5.4 8-5.4S18.5 16.4 20 20" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg></div>
          <h3>Patientenportal</h3>
          <p>Patientinnen und Patienten sehen im eigenen Portal ihren aktuellen Aufenthalt und ihren Medikamentenplan.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- MODULES / HIERARCHY -->
  <section id="module" class="modules">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Module</span>
        <h2 class="h2">Vom Haus bis zum Bett.</h2>
        <p class="sub">NexCare bildet Ihre Klinikstruktur 1:1 ab. Jede Ebene ist eigenständig steuerbar und liefert die Daten für alle anderen.</p>
      </div>
      <div class="hierarchy">
        <div class="hier"><div class="num">01</div><h4>Krankenhaus</h4><p>Mandanten- und Standortverwaltung mit klinikweiten Richtlinien.</p></div>
        <div class="hier"><div class="num">02</div><h4>Etage</h4><p>Übergeordnete Einheit für Wege, Reinigung und Logistik.</p></div>
        <div class="hier"><div class="num">03</div><h4>Abteilung</h4><p>Fachbereich wie Kardiologie, Onkologie oder Pädiatrie.</p></div>
        <div class="hier"><div class="num">04</div><h4>Station</h4><p>Operative Einheit der Pflege mit Schichtplanung.</p></div>
        <div class="hier"><div class="num">05</div><h4>Zimmer</h4><p>Räumliche Zuordnung inkl. Isolation und Ausstattung.</p></div>
        <div class="hier"><div class="num">06</div><h4>Bett</h4><p>Patientenzuordnung, Verlegung und Belegungs­historie.</p></div>
      </div>
    </div>
  </section>

  <!-- ROLES -->
  <section id="rollen">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Rollen</span>
        <h2 class="h2">Zugeschnitten auf jede Rolle.</h2>
        <p class="sub">Jede Rolle erhält genau die Ansicht und die Rechte, die sie für den Alltag braucht. Nicht mehr und nicht weniger.</p>
      </div>
      <div class="roles">
        <div class="role"><span class="tag">Doctor</span><h4>Arzt</h4><p>Zugriff auf Betten, Medikamentenplan und Patientenportal.</p></div>
        <div class="role"><span class="tag">Nurse</span><h4>Pflege</h4><p>Arbeitet mit Betten und dem Medikamentenplan im Stationsalltag.</p></div>
        <div class="role"><span class="tag">Management</span><h4>Krankenhaus-Management</h4><p>Sicht auf Betten und Medikamentenverwaltung des Hauses.</p></div>
        <div class="role"><span class="tag">Empfang</span><h4>Krankenhaus-Empfang</h4><p>Aufnahme und Stammdaten der Patienten sowie Bettenzuteilung.</p></div>
        <div class="role"><span class="tag">IT</span><h4>Krankenhaus-IT</h4><p>Technische Sicht auf die Bettenstruktur des Krankenhauses.</p></div>
        <div class="role"><span class="tag">Patient</span><h4>Patient</h4><p>Eigenes Patientenportal mit Aufenthalt und Medikation.</p></div>
      </div>
    </div>
  </section>

  <!-- MEDIKATION & WECHSELWIRKUNGEN -->
  <section id="sicherheit" class="modules">
    <div class="container security">
      <div>
        <span class="eyebrow">Medikation</span>
        <h2 class="h2">Medikamentenplan mit Wechselwirkungs­prüfung.</h2>
        <p class="sub">Jedes Medikament im zentralen Stammkatalog mit Wirkstoff und Dosiereinheit. Im Medikamentenplan eines Patienten lassen sich Mittel über die Suche hinzufügen. Bekannte Wechselwirkungen werden direkt sichtbar.</p>
        <div class="checks">
          <div class="chk"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Stammkatalog</b><span>Name, Wirkstoff, Beschreibung, Dosier­einheit zentral gepflegt.</span></div></div>
          <div class="chk"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Suche nach Wirkstoff</b><span>Volltextsuche im Katalog beim Hinzufügen zum Plan.</span></div></div>
          <div class="chk"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Wechselwirkungs­prüfung</b><span>Eigene Seite für Interaktionen im aktuellen Medikamentenplan.</span></div></div>
          <div class="chk"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Archivierung</b><span>Nicht mehr genutzte Medikamente werden archiviert statt gelöscht.</span></div></div>
          <div class="chk"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Rollen­gerechter Zugriff</b><span>Arzt und Pflege arbeiten am Plan, Management sieht die Verwaltung.</span></div></div>
          <div class="chk"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>JWT-Authentifizierung</b><span>Jede Aktion ist einem Benutzer mit klarer Rolle zugeordnet.</span></div></div>
        </div>
      </div>

      <div class="card-stack" aria-hidden="true">
        <div class="floating f1">
          <div style="font-weight:600;font-size:14px">Medikamentenplan</div>
          <div class="small">Patient · Zimmer 204</div>
          <div style="margin-top:12px;font-size:13px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between"><span>Marcumar</span><span style="color:var(--ink-400)">Phenprocoumon</span></div>
            <div style="display:flex;justify-content:space-between"><span>Ibuprofen</span><span style="color:var(--ink-400)">400 mg</span></div>
            <div style="display:flex;justify-content:space-between"><span>Ramipril</span><span style="color:var(--ink-400)">5 mg</span></div>
          </div>
        </div>
        <div class="floating f2" style="border:1px solid #F3C6C0">
          <div style="display:flex;align-items:center;gap:8px;color:var(--red-600);font-weight:700;font-size:13px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5M12 18v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Wechselwirkung
          </div>
          <div class="small" style="color:var(--ink-700);margin-top:6px">Marcumar × Ibuprofen: erhöhtes Blutungs­risiko.</div>
        </div>
        <div class="floating f3">
          <div style="font-weight:600;font-size:14px">Wirkstoff-Suche</div>
          <div class="small">3 Treffer im Katalog</div>
          <div style="margin-top:10px;font-size:13px;color:var(--ink-500)">„paracet…"</div>
          <div style="margin-top:6px;font-size:13px">Paracetamol · Paracetamol comp. · Panadol</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section id="demo" style="padding:80px 0">
    <div class="container">
      <div class="cta">
        <div>
          <h3 class="serif" style="font-family:'Instrument Serif',Georgia,serif;font-size:36px;font-weight:400;margin:0 0 8px">NexCare ausprobieren.</h3>
          <p>Anmelden mit einem der Demo-Benutzer oder einfach in der lokalen Umgebung starten.</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn-primary btn-lg" @click.prevent="router.push('/patients')">Anmelden</a>
          <a class="btn btn-ghost btn-lg" href="#" @click.prevent="scrollTo('module')">Module ansehen</a>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer id="kontakt">
    <div class="container">
      <div class="foot-grid foot">
        <div>
          <a class="brand" href="#" @click.prevent="scrollTo('hero')">
            <span class="brand-mark">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="white" stroke-width="2.6" stroke-linecap="round"/></svg>
            </span>
            NexCare
          </a>
          <p style="margin-top:12px;max-width:340px">Das Krankenhausinformations­system für den klinischen Alltag.</p>
        </div>
        <div>
          <h6>Plattform</h6>
          <ul>
            <li><a href="#" @click.prevent="scrollTo('features')">Funktionen</a></li>
            <li><a href="#" @click.prevent="scrollTo('module')">Module</a></li>
            <li><a href="#" @click.prevent="scrollTo('rollen')">Rollen</a></li>
            <li><a href="#" @click.prevent="scrollTo('sicherheit')">Medikation</a></li>
          </ul>
        </div>
        <div>
          <h6>Unternehmen</h6>
          <ul>
            <li><a href="#">Über uns</a></li>
            <li><a href="#">Partner</a></li>
            <li><a href="#" @click.prevent="openKarriere()">Karriere</a></li>
            <li><a href="#" @click.prevent="openContact()">Kontakt</a></li>
          </ul>
        </div>
        <div>
          <h6>Rechtliches</h6>
          <ul>
            <li><router-link to="/impressum">Impressum</router-link></li>
            <li><router-link to="/datenschutz">Datenschutz</router-link></li>
            <li><a href="#">AGB</a></li>
            <li><a href="#">Status</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 NexCare GmbH · Hergestellt in Deutschland</span>
        <span>Made with care for clinical teams.</span>
      </div>
    </div>
  </footer>

  <!-- KARRIERE MODAL -->
  <Teleport to="body">
    <div v-if="karriereOpen" class="modal-overlay" @click.self="closeKarriere">
      <div class="modal-box" role="dialog" aria-modal="true" aria-label="Karriere bei NexCare">
        <div class="modal-head">
          <h3>Karriere bei NexCare</h3>
          <button class="modal-close" @click="closeKarriere" aria-label="Schließen">✕</button>
        </div>
        <form class="modal-body" @submit.prevent="sendKarriere">
          <div class="form-group">
            <label for="k-name">Name *</label>
            <input id="k-name" v-model="karriere.name" type="text" placeholder="Max Mustermann" required />
          </div>
          <div class="form-group">
            <label for="k-email">E-Mail *</label>
            <input id="k-email" v-model="karriere.email" type="email" placeholder="max@beispiel.de" required />
          </div>
          <div class="form-group">
            <label for="k-position">Gewünschte Stelle *</label>
            <input id="k-position" v-model="karriere.position" type="text" placeholder="z.B. Frontend-Entwickler" required />
          </div>
          <div class="form-group">
            <label for="k-msg">Nachricht *</label>
            <textarea id="k-msg" v-model="karriere.message" rows="4" placeholder="Erzählen Sie uns etwas über sich..." required></textarea>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn btn-ghost" @click="closeKarriere">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Bewerbung senden</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- CONTACT MODAL -->
  <Teleport to="body">
    <div v-if="contactOpen" class="modal-overlay" @click.self="closeContact">
      <div class="modal-box" role="dialog" aria-modal="true" aria-label="Kontaktformular">
        <div class="modal-head">
          <h3>Demo anfragen</h3>
          <button class="modal-close" @click="closeContact" aria-label="Schließen">✕</button>
        </div>
        <form class="modal-body" @submit.prevent="sendContact">
          <div class="form-group">
            <label for="c-name">Name *</label>
            <input id="c-name" v-model="contact.name" type="text" placeholder="Max Mustermann" required />
          </div>
          <div class="form-group">
            <label for="c-email">E-Mail *</label>
            <input id="c-email" v-model="contact.email" type="email" placeholder="max@klinik.de" required />
          </div>
          <div class="form-group">
            <label for="c-msg">Nachricht *</label>
            <textarea id="c-msg" v-model="contact.message" rows="4" placeholder="Wie können wir Ihnen helfen?" required></textarea>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn btn-ghost" @click="closeContact">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Anfrage senden</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Globale CSS-Tokens für die Startseite — kein scoped, damit :root greift */
:root {
  --ink-900: #0B1F33;
  --ink-700: #1E3A57;
  --ink-500: #4B6B86;
  --ink-400: #7A93AB;
  --ink-300: #B7C7D5;
  --bg: #F6F9FC;
  --surface: #FFFFFF;
  --line: #E3ECF3;
  --primary-700: #0B5A8A;
  --primary-600: #0F6FA8;
  --primary-500: #1488C7;
  --primary-50: #E8F3FB;
  --teal-600: #0EA5A8;
  --teal-50: #E5F7F7;
  --green-600: #1F9D6B;
  --amber-600: #D08A0E;
  --red-600: #C0392B;
  --shadow-lg: 0 30px 60px -25px rgba(11,31,51,.18), 0 12px 24px -16px rgba(11,31,51,.12);
  --shadow-sm: 0 1px 2px rgba(11,31,51,.04), 0 4px 14px -6px rgba(11,31,51,.08);
  --radius: 14px;
}
</style>

<style scoped>

/* ===== RESET / BASE ===== */
*, *::before, *::after { box-sizing: border-box; }
a { color: inherit; text-decoration: none; }

.container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
.serif { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -.01em; }

/* ===== TOP BAR ===== */
.topbar {
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: saturate(180%) blur(14px);
  background: rgba(246,249,252,.78);
  border-bottom: 1px solid var(--line);
}
.nav {
  display: flex; align-items: center; justify-content: space-between; height: 68px;
}
.brand {
  display: flex; align-items: center; gap: 10px;
  font-weight: 700; letter-spacing: -.01em;
}
.brand-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-600), var(--teal-600));
  display: grid; place-items: center; color: white;
  box-shadow: 0 6px 18px -6px rgba(15,111,168,.55);
}
.brand-mark svg { width: 18px; height: 18px; }
nav ul {
  display: flex; gap: 28px; list-style: none; margin: 0; padding: 0;
  color: var(--ink-500); font-weight: 500; font-size: 14.5px;
}
nav ul a:hover { color: var(--primary-700); }
.actions { display: flex; gap: 10px; align-items: center; }
.burger {
  display: none; background: none; border: 1px solid var(--line);
  width: 40px; height: 40px; border-radius: 10px;
  align-items: center; justify-content: center; cursor: pointer;
}
.burger svg { width: 18px; height: 18px; color: var(--ink-700); }
.mobile-menu {
  display: none; background: white; border-bottom: 1px solid var(--line); padding: 14px 28px;
}
.mobile-menu.open { display: block; }
.mobile-menu a {
  display: block; padding: 12px 4px; color: var(--ink-700);
  font-weight: 500; border-bottom: 1px solid var(--line);
}
.mobile-menu a:last-child { border-bottom: none; }

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 18px; border-radius: 10px; font-weight: 600; font-size: 14.5px;
  border: 1px solid transparent; cursor: pointer; transition: all .15s ease;
  white-space: nowrap;
}
.btn-primary {
  background: var(--primary-700); color: white;
  box-shadow: 0 8px 20px -10px rgba(11,90,138,.6);
}
.btn-primary:hover { background: #094a72; transform: translateY(-1px); color: white; }
.btn-ghost { background: transparent; color: var(--ink-700); border-color: var(--line); }
.btn-ghost:hover { border-color: var(--ink-300); background: white; }
.btn-lg { padding: 14px 22px; font-size: 15.5px; border-radius: 12px; }

/* ===== HERO ===== */
.hero { position: relative; overflow: hidden; padding: 88px 0 64px; }
.hero-bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(800px 360px at 10% -10%, rgba(20,136,199,.12), transparent 60%),
    radial-gradient(700px 340px at 95% -20%, rgba(14,165,168,.12), transparent 60%),
    linear-gradient(180deg, #FAFCFE 0%, var(--bg) 100%);
}
.grid-overlay {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(rgba(11,31,51,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(11,31,51,.04) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at 50% 0%, black 35%, transparent 70%);
}
.hero-inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center;
}
h1.headline {
  font-size: clamp(40px,5.4vw,64px);
  line-height: 1.04; letter-spacing: -.02em;
  margin: 18px 0 18px; font-weight: 700;
}
h1.headline .serif { font-style: italic; color: var(--ink-700); }
.lede { font-size: 18.5px; color: var(--ink-500); max-width: 560px; margin: 0 0 28px; }
.cta-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.trust { margin-top: 28px; display: flex; gap: 22px; flex-wrap: wrap; color: var(--ink-500); font-size: 13.5px; }
.trust span { display: inline-flex; align-items: center; gap: 8px; }
.trust svg { width: 16px; height: 16px; color: var(--green-600); }

/* Dashboard mock */
.mock {
  background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.mock-bar {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  border-bottom: 1px solid var(--line); background: #FBFDFE;
}
.mock-bar .dot { width: 10px; height: 10px; border-radius: 50%; background: #E3ECF3; }
.mock-bar .dot.r { background: #F1A6A0; }
.mock-bar .dot.y { background: #F2D08A; }
.mock-bar .dot.g { background: #A6DBC0; }
.crumbs { margin-left: 14px; color: var(--ink-400); font-size: 12.5px; }
.dash { padding: 26px 26px 28px; }
.dash h4 { margin: 0; font-size: 22px; letter-spacing: -.01em; }
.sub2 { margin: 4px 0 22px; color: var(--ink-400); font-size: 13.5px; }
.dash-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.dcard {
  border: 1px solid var(--line); border-radius: 12px; padding: 16px; background: white;
  display: flex; flex-direction: column; gap: 10px; min-height: 118px;
}
.dcard .icn {
  width: 40px; height: 40px; border-radius: 10px; background: var(--primary-50);
  display: grid; place-items: center; color: var(--primary-700);
}
.dcard .icn svg { width: 22px; height: 22px; }
.dcard .lbl { font-size: 14px; font-weight: 600; color: var(--ink-900); }
.dcard .open { font-size: 12px; color: var(--primary-700); font-weight: 600; margin-top: auto; }

/* ===== SECTIONS ===== */
section { padding: 88px 0; }
.eyebrow { font-size: 13px; color: var(--primary-700); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.h2 { font-size: clamp(30px,3.4vw,42px); line-height: 1.1; letter-spacing: -.02em; margin: 10px 0 14px; font-weight: 700; }
.sub { color: var(--ink-500); max-width: 680px; font-size: 17px; }
.section-head { margin-bottom: 48px; }

/* Feature cards */
.features { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
.card {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 26px; box-shadow: var(--shadow-sm); transition: transform .15s ease, box-shadow .15s ease;
}
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.ico {
  width: 42px; height: 42px; border-radius: 11px; display: grid; place-items: center;
  color: white; margin-bottom: 16px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
  box-shadow: 0 8px 18px -10px rgba(15,111,168,.65);
}
.ico.teal { background: linear-gradient(135deg, var(--teal-600), #27c1bf); }
.ico.green { background: linear-gradient(135deg, var(--green-600), #3fc78a); }
.ico.amber { background: linear-gradient(135deg, #E1A02B, #F0BD55); }
.ico.navy { background: linear-gradient(135deg, var(--ink-700), var(--ink-500)); }
.ico.red { background: linear-gradient(135deg, #C0392B, #E15B4D); }
.ico svg { width: 22px; height: 22px; }
.card h3 { margin: 0 0 6px; font-size: 17.5px; letter-spacing: -.01em; }
.card p { margin: 0; color: var(--ink-500); font-size: 14.5px; }

/* Hierarchy */
.modules {
  background: linear-gradient(180deg, #F1F7FB, var(--bg));
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
}
.hierarchy { display: grid; grid-template-columns: repeat(6,1fr); gap: 10px; margin-top: 36px; }
.hier {
  background: white; border: 1px solid var(--line); border-radius: 12px; padding: 16px;
  position: relative; overflow: hidden;
}
.hier .num { font-size: 11px; font-weight: 700; color: var(--primary-700); letter-spacing: .1em; }
.hier h4 { margin: 6px 0 4px; font-size: 15.5px; }
.hier p { margin: 0; font-size: 13px; color: var(--ink-500); }
.hier::after {
  content: ""; position: absolute; right: -30px; top: -30px;
  width: 90px; height: 90px; border-radius: 50%;
  background: radial-gradient(circle, var(--primary-50), transparent 70%);
}

/* Roles */
.roles { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 28px; }
.role { border: 1px solid var(--line); background: white; border-radius: 12px; padding: 18px 18px 16px; }
.role .tag { font-size: 11px; font-weight: 700; color: var(--ink-400); letter-spacing: .1em; text-transform: uppercase; }
.role h4 { margin: 6px 0 6px; font-size: 16px; }
.role p { margin: 0; color: var(--ink-500); font-size: 13.5px; }

/* Security / Medikation */
.security { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.checks { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; margin-top: 18px; }
.chk { display: flex; gap: 10px; align-items: flex-start; }
.chk svg { flex: 0 0 auto; width: 20px; height: 20px; color: var(--green-600); margin-top: 2px; }
.chk b { display: block; font-size: 14.5px; }
.chk span { font-size: 13.5px; color: var(--ink-500); }

.card-stack { position: relative; height: 380px; }
.floating {
  position: absolute; background: white; border: 1px solid var(--line);
  border-radius: 14px; padding: 16px 18px; box-shadow: var(--shadow-lg); min-width: 240px;
}
.floating.f1 { top: 0; left: 0; width: 280px; }
.floating.f2 { top: 120px; right: 0; width: 260px; }
.floating.f3 { bottom: 0; left: 60px; width: 300px; }
.small { font-size: 12px; color: var(--ink-400); margin-top: 2px; }

/* CTA */
.cta {
  background: linear-gradient(135deg, var(--primary-700), #0a4a72 60%, #0a5d6b);
  color: white; border-radius: 22px; padding: 54px 56px;
  display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
  box-shadow: var(--shadow-lg);
}
.cta p { margin: 0; color: #CFE3F2; max-width: 520px; }
.cta .btn-primary { background: white; color: var(--primary-700); box-shadow: none; }
.cta .btn-primary:hover { background: #F1F7FB; color: var(--primary-700); }
.cta .btn-ghost { border-color: rgba(255,255,255,.25); color: white; }
.cta .btn-ghost:hover { background: rgba(255,255,255,.08); }

/* Footer */
footer {
  padding: 56px 0 32px; color: var(--ink-500); font-size: 13.5px;
  border-top: 1px solid var(--line); background: #FBFDFE;
}
.foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 36px; }
.foot h6 { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-700); margin: 0 0 12px; }
.foot ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.foot a:hover, .foot :deep(a:hover) { color: var(--primary-700); }
.foot :deep(a) { color: inherit; text-decoration: none; }
.foot-bottom {
  margin-top: 36px; display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--line); padding-top: 18px;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(11,31,51,.55);
  backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 1rem;
}
.modal-box {
  background: white; border-radius: 16px; width: 100%; max-width: 480px;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--line);
}
.modal-head h3 { margin: 0; font-size: 1.125rem; font-weight: 700; }
.modal-close {
  background: none; border: none; font-size: 1.1rem; cursor: pointer;
  color: var(--ink-400); padding: 0.25rem; line-height: 1;
}
.modal-close:hover { color: var(--ink-900); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: var(--ink-700); }
.form-group input,
.form-group textarea {
  border: 1px solid var(--line); border-radius: 8px; padding: 0.625rem 0.875rem;
  font-size: 0.9375rem; font-family: inherit; color: var(--ink-900);
  outline: none; transition: border-color .15s; width: 100%; resize: vertical;
  background: white;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--primary-600); }
.modal-foot { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }

/* ===== RESPONSIVE ===== */
@media (max-width: 880px) {
  nav ul { display: none; }
  .actions .btn-ghost { display: none; }
  .burger { display: inline-flex; }
}
@media (max-width: 980px) {
  .hero-inner { grid-template-columns: 1fr; gap: 36px; }
  .security { grid-template-columns: 1fr; }
  .card-stack { position: static; height: auto; display: flex; flex-direction: column; gap: 12px; }
  .floating { position: static !important; width: 100% !important; min-width: 0; }
}
@media (max-width: 900px) {
  .features { grid-template-columns: 1fr 1fr; }
  .hierarchy { grid-template-columns: repeat(2,1fr); }
  .roles { grid-template-columns: 1fr 1fr; }
  .foot-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 620px) {
  .features { grid-template-columns: 1fr; }
  .roles { grid-template-columns: 1fr; }
  .hierarchy { grid-template-columns: 1fr; }
  .checks { grid-template-columns: 1fr; }
  .cta { padding: 34px 26px; border-radius: 18px; }
  .cta .btn { width: 100%; justify-content: center; }
  .foot-grid { grid-template-columns: 1fr; }
  section { padding: 64px 0; }
  .hero { padding: 40px 0 56px; }
  h1.headline { font-size: 36px; }
  .lede { font-size: 16px; }
  .cta-row { flex-direction: column; width: 100%; }
  .cta-row .btn { justify-content: center; width: 100%; }
}
</style>
