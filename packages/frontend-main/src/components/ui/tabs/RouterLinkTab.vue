<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { cn } from '@/utility';

defineProps<{ label: string; isActive: boolean; to: string }>();

</script>

<template>
  <RouterLink class="flex-1 h-[40x] py-6 hover:bg-accent active:bg-accent" :to="to">
    <div :class="cn('mx-auto w-full max-w-[180px] h-full pb-2 text-center', isActive && 'border-b-4 border-primary')">
      <h2 class="text-lg font-semibold">{{ label }}</h2>
    </div>
  </RouterLink>
</template>
