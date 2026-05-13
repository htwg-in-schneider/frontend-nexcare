<script setup>
defineProps({
  active: {
    type: String,
    default: 'patienten',
  },
});

function notImplemented(label) {
  alert(`${label} ist noch nicht implementiert.`);
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Hauptnavigation">
    <div class="nav-inner">
      <a href="#" class="nav-item" :class="{ active: active === 'home' }" @click.prevent="notImplemented('Home')">
        <i class="bi bi-house"></i>
        <span>Home</span>
      </a>
      <a href="#" class="nav-item" :class="{ active: active === 'patienten' }" @click.prevent>
        <i class="bi bi-person-fill"></i>
        <span>Patienten</span>
      </a>
      <a href="#" class="nav-item" :class="{ active: active === 'betten' }" @click.prevent="notImplemented('Betten')">
        <i class="bi bi-square"></i>
        <span>Betten</span>
      </a>
      <a href="#" class="nav-item" :class="{ active: active === 'account' }" @click.prevent="notImplemented('Account')">
        <i class="bi bi-person"></i>
        <span>Account</span>
      </a>
    </div>
  </nav>
</template>

<style scoped></style>
