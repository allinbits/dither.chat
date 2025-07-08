<script setup lang="ts">

import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

defineProps<{ title?: string }>();

const { back } = useRouter();

</script>

<template>
  <div class="flex flex-row items-center w-full border-b px-2 h-[62px]">
    <button @click="back" class="flex flex-row items-center gap-1 p-2 mr-5 rounded-full hover:bg-accent active:bg-accent transition-colors">
      <ArrowLeft class="size-6" />
    </button>
    <h1 v-if="title" class="text-lg font-semibold ">
      {{ title }}
    </h1>
  </div>
</template>
