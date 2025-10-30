<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { ref } from 'vue';

const switchState = ref(false);
</script>

<template>
  <SwitchRoot
    id="airplane-mode"
    v-model="switchState"
    class="w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-neutral-800 dark:data-[state=unchecked]:bg-neutral-800 dark:data-[state=checked]:bg-neutral-600 border border-neutral-300 data-[state=checked]:border-neutral-700  dark:border-neutral-600 rounded-full relative transition-[background] "
  >
    <SwitchThumb
      class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
    />
  </SwitchRoot>
</template>
