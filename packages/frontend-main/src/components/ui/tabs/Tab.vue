<script setup lang="ts">
import { cn } from '@/utility';

defineProps<{ label: string; isActive: boolean; onClick: () => void }>();

</script>

<template>
  <button class="max-w-[180px] w-full" @click="onClick">
    <div :class="cn(isActive && 'border-b-4 border-primary', 'h-full pb-2 text-center')">
      <span class="text-lg font-semibold">{{ label }}</span>
    </div>
  </button>
</template>
