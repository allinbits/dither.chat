<script setup lang="ts">
import LeftPanel from './panels/LeftPanel.vue';
import RightPanel from './panels/RightPanel.vue';

</script>

<template>
  <div class="flex flex-col items-center h-screen">
    <div class="flex flex-row w-full h-screen justify-center">

      <!-- TODO: LEFTPANEL -->
      <LeftPanel />

      <main class="flex flex-row justify-center max-w-[var(--main-max-width)] w-full">
        <div class="flex flex-col grow w-full m-auto">
          <slot />
        </div>
      </main>

      <!-- TODO: RIGHTPANEL -->
      <RightPanel />

    </div>
  </div>
</template>
