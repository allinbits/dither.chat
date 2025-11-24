<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="alert-title"
    class="col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight" :class="[$props.class]"
  >
    <slot />
  </div>
</template>
