<script setup lang="ts">
import Button from '../button/Button.vue';

import { cn } from '@/utility';

defineProps<{ label: string; isActive: boolean; onClick: () => void }>();

</script>

<template>
  <Button class="flex-1 h-[40x] py-6" @click="onClick" variant="ghost">
    <div :class="cn('mx-auto w-full max-w-[180px] h-full pb-2 text-center', isActive && 'border-b-4 border-primary')">
      <h2 class="text-lg font-semibold">{{ label }}</h2>
    </div>
  </Button>
</template>
