<script setup lang="ts">
import BottomPanel from './panels/BottomPanel.vue';
import TopPanel from './panels/TopPanel.vue';
</script>

<template>
  <div class="w-full h-mobile-panel sticky top-0 z-99">
    <TopPanel />
  </div>

  <main class="min-h-dvh flex flex-col flex-1">
    <slot />
  </main>

  <div class="w-full h-mobile-panel sticky bottom-0 z-99">
    <BottomPanel />
  </div>
</template>
