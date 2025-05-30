<script setup lang="ts">
import { useToast } from '@/composables/useToast';

import { Toast, ToastAction, ToastClose, ToastDescription, ToastTitle } from '@/components/ui/toast';

const { title, desc, open, hideToast } = useToast();
</script>

<template>
  <Toast :open="open" @update:open="hideToast">
    <ToastTitle>
      {{ title }}
    </ToastTitle>
    <ToastDescription>
      {{ desc }}
    </ToastDescription>
    <ToastAction altText="Action">
      Action
    </ToastAction>
    <ToastClose>
      Close
    </ToastClose>
  </Toast>
</template>
