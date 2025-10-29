<script setup lang="ts">
import BottomPanel from './panels/BottomPanel.vue';
import TopPanel from './panels/TopPanel.vue';
</script>

<template>
  <div class="w-full h-[58px] sticky top-0 z-99">
    <TopPanel />
  </div>

  <main class="min-h-[100vh]">
    <slot />
  </main>

  <div class="w-full h-[58px] sticky bottom-0 z-99">
    <BottomPanel />
  </div>
</template>
