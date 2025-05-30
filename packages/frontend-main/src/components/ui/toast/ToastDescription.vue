<script setup lang="ts">
import type { ToastDescriptionProps } from 'reka-ui';

import { ToastDescription, useForwardProps } from 'reka-ui';

const props = defineProps<ToastDescriptionProps>();

const forwarded = useForwardProps(props);

</script>

<template>
  <ToastDescription
    data-slot="toast-description"
    v-bind="forwarded"
    class="text-sm text-gray-500"
  >
    <slot />
  </ToastDescription>
</template>
