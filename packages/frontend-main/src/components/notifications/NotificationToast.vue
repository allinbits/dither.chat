<script setup lang="ts">
import { useToast } from '@/composables/useToast';

import { Toast, ToastAction, ToastDescription, ToastTitle } from '@/components/ui/toast';

const { toastState, hideToast } = useToast();
</script>

<template>
  <Toast :open="toastState.open" :duration="toastState.duration" @update:open="hideToast" v-if="toastState.open">
    <ToastTitle class="text-sm font-bold text-left w-full">
      {{ toastState.title }}
    </ToastTitle>
    <ToastDescription class="text-sm text-gray-500 text-left w-full line-clamp-2 overflow-auto">
      {{ toastState.desc }}
    </ToastDescription>
    <ToastAction v-if="toastState.action" :altText="toastState.action.label" @click="toastState.action.onClick" class="text-sm text-blue-500 text-right w-full">
      {{ toastState.action.label }}
    </ToastAction>
  </Toast>
</template>
