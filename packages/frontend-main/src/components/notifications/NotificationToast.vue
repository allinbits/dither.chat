<script setup lang="ts">
import { useToast } from '@/composables/useToast';

import { Toast, ToastAction, ToastDescription, ToastTitle } from '@/components/ui/toast';

const { title, desc, open, hideToast } = useToast();
</script>

<template>
  <Toast :open="open" @update:open="hideToast" v-if="open">
    <ToastTitle class="text-sm font-bold text-gray-900 text-left w-full">
      {{ title }}
    </ToastTitle>
    <ToastDescription class="text-sm text-gray-500 text-left w-full line-clamp-2">
      {{ desc }}
    </ToastDescription>
    <ToastAction altText="Action" @click="hideToast">
      {{ $t('components.Button.close') }}
    </ToastAction>
  </Toast>
</template>
