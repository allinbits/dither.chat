<script setup lang="ts">
import { useDark, useMediaQuery, useToggle } from '@vueuse/core';
import { Moon, Sun } from 'lucide-vue-next';
import { SwitchRoot, SwitchThumb } from 'reka-ui';

import { cn } from '@/utility';

const isSmallScreen = useMediaQuery(`(max-width: 480px)`);
const isDarkMode = useDark({ disableTransition: false });
const toggleColorMode = useToggle(isDarkMode);
</script>

<template>
  <div class="flex">
    <SwitchRoot
      data-slot="switch"
      :model-value="isDarkMode"
      :class="cn(
        'relative h-10 rounded-full bg-input',
        isSmallScreen ? 'w-10' : 'w-16',
      )"
      @update:model-value="toggleColorMode"
    >
      <SwitchThumb
        data-slot="switch-thumb"
        :class="cn(
          'absolute top-1 left-1 size-8 rounded-full bg-background !transition-transform duration-300 ease-in-out',
          !isSmallScreen && 'data-[state=checked]:translate-x-[1.5rem]',
        )"
      >
        <div class="flex h-full w-full items-center justify-center">
          <Moon v-if="isDarkMode" class="size-5" />
          <Sun v-else class="size-5" />
        </div>
      </SwitchThumb>
    </SwitchRoot>
  </div>
</template>
