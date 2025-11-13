<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="alert-description"
    class="text-muted-foreground col-start-2 grid justify-items-start gap-1 text-xs [&_p]:leading-relaxed" :class="[$props.class]"
  >
    <slot />
  </div>
</template>
