<script setup lang="ts">
import type { ColorTheme } from '@/composables/useColorTheme';

import { useMediaQuery } from '@vueuse/core';
import { Atom, Moon, Sun } from 'lucide-vue-next';
import { computed } from 'vue';

import { useColorTheme } from '@/composables/useColorTheme';
import { cn } from '@/utility';

const isSmallScreen = useMediaQuery(`(max-width: 480px)`);
const { theme, cycleTheme } = useColorTheme();

const themeIcon = computed(() => {
  switch (theme.value) {
    case 'dark':
      return Moon;
    case 'atomone':
      return Atom;
    default:
      return Sun;
  }
});

const themePosition = computed(() => {
  switch (theme.value) {
    case 'dark':
      return 'translate-x-[1.5rem]';
    case 'atomone':
      return 'translate-x-[3rem]';
    default:
      return 'translate-x-0';
  }
});
</script>

<template>
  <button
    type="button"
    :class="cn(
      'relative h-10 rounded-full bg-input transition-colors',
      isSmallScreen ? 'w-10' : 'w-[5.75rem]',
    )"
    :aria-label="`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'atomone' : 'light'} mode`"
    @click="cycleTheme"
  >
    <div
      :class="cn(
        'absolute top-0.5 left-0.5 size-9 rounded-full bg-background !transition-transform duration-300 ease-in-out shadow-sm flex items-center justify-center',
        themePosition,
      )"
    >
      <component :is="themeIcon" class="size-4 text-muted-foreground" />
    </div>
  </button>
</template>
