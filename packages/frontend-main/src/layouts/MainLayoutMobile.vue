<script setup lang="ts">
import BottomPanel from './panels/BottomPanel.vue';
import TopPanel from './panels/TopPanel.vue';

</script>

<template>
  <!-- TODO: TOPPANEL -->
  <TopPanel />

  <main>
    <slot />
  </main>

  <!-- TODO: BOTTOMPANEL -->
  <BottomPanel />
</template>
