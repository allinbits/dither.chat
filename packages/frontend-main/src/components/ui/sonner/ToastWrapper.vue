<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
    close: () => void;
}>();
</script>

<template>
  <div
    class="flex items-center gap-2 p-4 rounded-xs bg-background border shadow-md cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 !transition-[background-color,border-color,box-shadow] duration-150"
    @click="close"
  >
    <slot />
  </div>
</template>
