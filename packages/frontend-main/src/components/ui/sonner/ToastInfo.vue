<script setup lang="ts">
import { Info } from 'lucide-vue-next';

import ToastWrapper from './ToastWrapper.vue';

defineProps<{
  close: () => void;
  title: string;
  description?: string;
}>();
</script>

<template>
  <ToastWrapper :close="close" class="min-w-[230px]">
    <div class="size-6">
      <Info class="text-blue-500" />
    </div>
    <div>
      <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
        {{ title }}
      </div>
      <div v-if="description" class="text-sm text-gray-700 dark:text-gray-300 mt-1">
        {{ description }}
      </div>
    </div>
  </ToastWrapper>
</template>
