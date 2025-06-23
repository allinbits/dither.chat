<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { cn } from '@/utility';

defineProps<{ label: string; isActive: boolean; to: string }>();

</script>

<template>
  <!-- <RouterLink class="max-w-[180px] w-full" :to="to"> -->
  <RouterLink :class="cn(isActive && 'border-b-4 border-primary', 'max-w-[180px] w-full h-full pb-2 text-center')" :to="to">
    <h2 class="text-lg font-semibold">{{ label }}</h2>
  </RouterLink>
  <!-- </RouterLink> -->
</template>
