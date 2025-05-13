<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';

import LeftPanel from './panels/LeftPanel.vue';
import RightPanel from './panels/RightPanel.vue';
import MainLayoutMobile from './MainLayoutMobile.vue';
const isMobile = useMediaQuery('(max-width: 767px)'); // md

</script>

<template>
  <MainLayoutMobile v-if="isMobile">
    <slot />
  </MainLayoutMobile>

  <div v-else class="flex flex-row justify-between">
    <div class="w-full h-[100vh] flex-1 xl:flex-auto overflow-y-auto sticky top-0">
      <div class="w-full max-w-[280px] h-full py-6 pl-6 pr-4 ml-auto">
        <LeftPanel />
      </div>
    </div>

    <main class="flex flex-row min-w-[var(--main-min-width-desktop)]">
      <slot />
    </main>

    <div class="w-full h-[100vh] flex-1 lg:flex-4 xl:flex-auto overflow-y-auto sticky top-0">
      <div class="w-full max-w-[358px] h-full p-6 hidden lg:block">
        <RightPanel  />
      </div>
    </div>

  </div>
</template>
