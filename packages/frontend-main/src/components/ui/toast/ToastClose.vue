<script setup lang="ts">
import type { ToastCloseProps } from 'reka-ui';

import { ToastClose, useForwardProps } from 'reka-ui';

const props = defineProps<ToastCloseProps>();

const forwarded = useForwardProps(props);
</script>

<template>
  <ToastClose
    data-slot="toast-close"
    v-bind="forwarded"
  >
    <slot />
  </ToastClose>
</template>
