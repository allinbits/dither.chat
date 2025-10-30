<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

defineProps<{ title?: string }>();

const { back } = useRouter();
</script>

<template>
  <div class="flex flex-row items-center w-full border-b px-2 h-[62px]">
    <button class="flex flex-row items-center gap-1 p-2 mr-5 rounded-full hover:bg-accent active:bg-accent transition-colors" @click="back">
      <ArrowLeft class="size-6" />
    </button>
    <h1 v-if="title" class="text-lg font-semibold ">
      {{ title }}
    </h1>
  </div>
</template>
