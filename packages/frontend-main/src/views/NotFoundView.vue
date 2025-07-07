<script setup lang="ts">
import ViewHeading from './ViewHeading.vue';

import MainLayout from '@/layouts/MainLayout.vue';

</script>

<template>
  <MainLayout>
    <div class="flex flex-col h-full">
      <ViewHeading/>

      <div class="flex flex-col flex-1 items-center justify-center  w-full">
        <h1 class="text-2xl font-bold">{{ $t('components.NotFound.title') }}</h1>
        <p class="text-gray-500">{{ $t('components.NotFound.message') }}</p>
      </div>
    </div>
  </MainLayout>

</template>
