<script setup lang="ts">
import type { ToastTitleProps } from 'reka-ui';

import { ToastTitle, useForwardProps } from 'reka-ui';

const props = defineProps<ToastTitleProps>();

const forwarded = useForwardProps(props);
</script>

<template>
  <ToastTitle
    data-slot="toast-title"
    v-bind="forwarded"
    class="text-sm font-medium text-gray-900"
  >
    <slot />
  </ToastTitle>
</template>
