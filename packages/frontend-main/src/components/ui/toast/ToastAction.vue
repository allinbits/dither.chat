<script setup lang="ts">
import type { ToastActionProps } from 'reka-ui';

import { ToastAction, useForwardProps } from 'reka-ui';

const props = defineProps<ToastActionProps>();

const forwarded = useForwardProps(props);
</script>

<template>
  <ToastAction
    data-slot="toast-action"
    v-bind="forwarded"
  >
    <slot />
  </ToastAction>
</template>
