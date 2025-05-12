<script setup lang="ts">
import BottomPanel from './panels/BottomPanel.vue';
import TopPanel from './panels/TopPanel.vue';

</script>

<template>
  <div class="flex flex-col overflow-x-hidden overflow-y-auto items-center">
    <div class="flex flex-row w-full h-full justify-center max-w-[1280px]">

      <!-- TODO: TOPPANEL -->

      <TopPanel />

      <div class="flex flex-col border-x border-neutral-200 h-full grow min-w-[600px]">
        <main>
          <slot />
        </main>
      </div>

      <!-- TODO: BOTTOMPANEL -->

      <BottomPanel />
    </div>
  </div>
</template>
