<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';

import { useWallet } from '@/composables/useWallet';

import { cn } from '@/utility';

const { isUsingSessionSigning, toggleSessionMode } = useWallet();
</script>

<template>
  <SwitchRoot
    data-slot="switch"
    :modelValue="isUsingSessionSigning"
    @update:modelValue="toggleSessionMode"
    :class="cn(
      'relative h-10 rounded-full bg-input',
    )"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="cn(
        'absolute top-1 left-1 size-8 rounded-full bg-background !transition-transform duration-300 ease-in-out'
      )"
    >
      <div class="flex h-full w-full items-center justify-center">

      </div>
    </SwitchThumb>
  </SwitchRoot>
</template>
