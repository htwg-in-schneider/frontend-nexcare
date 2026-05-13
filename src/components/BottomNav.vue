<script setup>
import BottomNavItem from './BottomNavItem.vue';

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
      <BottomNavItem icon="bi-house"        label="Home"      :active="active === 'home'"      @click="notImplemented('Home')" />
      <BottomNavItem icon="bi-person-fill"  label="Patienten" :active="active === 'patienten'" />
      <BottomNavItem icon="bi-square"       label="Betten"    :active="active === 'betten'"    @click="notImplemented('Betten')" />
      <BottomNavItem icon="bi-person"       label="Account"   :active="active === 'account'"   @click="notImplemented('Account')" />
    </div>
  </nav>
</template>

<style scoped></style>
