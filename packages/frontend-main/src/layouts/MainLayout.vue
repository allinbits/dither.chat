<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';

import LeftPanel from './panels/LeftPanel.vue';
import RightPanel from './panels/RightPanel.vue';
import MainLayoutMobile from './MainLayoutMobile.vue';

import { breakpoints } from '@/utility/breakpoints';
const isMobile = useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);

</script>

<template>
  <MainLayoutMobile v-if="isMobile">
    <slot />
  </MainLayoutMobile>

  <div
    v-else
    class="flex flex-row justify-between"
  >
    <div class="w-full h-[100vh] flex-1 xl:flex-auto overflow-y-auto sticky top-0">
      <LeftPanel class="max-w-[280px] ml-auto"/>
    </div>

    <main class="sm:w-[var(--main-min-width-desktop)] min-w-[var(--main-min-width-desktop)] md:border-x">
      <slot />
    </main>

    <div class="w-full h-[100vh] flex-1 lg:flex-4 xl:flex-auto overflow-y-auto sticky top-0">
      <RightPanel class="max-w-[358px] hidden lg:flex"/>
    </div>
  </div>
</template>
