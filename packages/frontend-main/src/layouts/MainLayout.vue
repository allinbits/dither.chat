<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import { breakpoints } from '@/utility/breakpoints';

import MainLayoutMobile from './MainLayoutMobile.vue';
import LeftPanel from './panels/LeftPanel.vue';
import LeftPanelTablet from './panels/LeftPanelTablet.vue';
import RightPanel from './panels/RightPanel.vue';

const isMobile = useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);

const leftSpacerRef = ref<HTMLDivElement>();
const rightSpacerRef = ref<HTMLDivElement>();
const leftPanelRef = ref<HTMLDivElement>();
const rightPanelRef = ref<HTMLDivElement>();

function updatePanelWidths() {
  if (leftSpacerRef.value && leftPanelRef.value) {
    leftPanelRef.value.style.width = `${leftSpacerRef.value.offsetWidth}px`;
  }
  if (rightSpacerRef.value && rightPanelRef.value) {
    rightPanelRef.value.style.width = `${rightSpacerRef.value.offsetWidth}px`;
  }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  updatePanelWidths();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updatePanelWidths);
    leftSpacerRef.value && resizeObserver.observe(leftSpacerRef.value);
    rightSpacerRef.value && resizeObserver.observe(rightSpacerRef.value);
  } else {
    window.addEventListener('resize', updatePanelWidths);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  } else {
    window.removeEventListener('resize', updatePanelWidths);
  }
});
</script>

<template>
  <MainLayoutMobile v-if="isMobile">
    <slot />
  </MainLayoutMobile>

  <div
    v-else
    class="flex flex-row justify-between"
  >
    <div
      ref="leftSpacerRef"
      class="flex-1 xl:flex-auto"
    />

    <div
      ref="leftPanelRef"
      class="fixed top-0 bottom-0 left-0 overflow-y-auto [overscroll-behavior:contain] md:border-r"
    >
      <LeftPanel v-if="isXl" />
      <LeftPanelTablet v-else />
    </div>

    <main class="sm:w-[var(--main-min-width-desktop)] min-w-[var(--main-min-width-desktop)]">
      <slot />
    </main>

    <div
      ref="rightSpacerRef"
      class="flex-1 lg:flex-4 xl:flex-auto"
    />

    <div
      ref="rightPanelRef"
      class="fixed top-0 bottom-0 right-0 overflow-y-auto [overscroll-behavior:contain] md:border-l"
    >
      <RightPanel class="hidden lg:flex" />
    </div>
  </div>
</template>
