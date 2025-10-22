<script setup lang="ts">
import { cn } from "@/utility";
</script>

<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6', $attrs.class)">
    <slot />
  </div>
</template>
