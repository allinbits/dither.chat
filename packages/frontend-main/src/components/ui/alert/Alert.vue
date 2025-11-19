<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import type { AlertVariants } from '.';

import { computed } from 'vue';

import { alertVariants } from '.';

const props = defineProps<{
  variant?: AlertVariants['variant'];
  class?: HTMLAttributes['class'];
}>();

const alertClasses = computed(() => alertVariants({ variant: props.variant }));
</script>

<template>
  <div
    data-slot="alert"
    role="alert"
    :class="[alertClasses, props.class]"
  >
    <slot />
  </div>
</template>
