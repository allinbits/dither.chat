<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';

defineProps<{ title?: string }>();

const { back } = useRouter();
</script>

<template>
  <div class="flex flex-row items-center w-full border-b px-2 h-[62px]">
    <Button variant="icon" size="icon" class="mr-5 p-2" @click="back">
      <ArrowLeft class="size-6" />
    </Button>
    <h1 v-if="title" class="text-lg font-semibold">
      {{ title }}
    </h1>
  </div>
</template>
