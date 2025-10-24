<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';

import ViewHeading from './ViewHeading.vue';
</script>

<template>
  <MainLayout>
    <div class="flex flex-col h-full">
      <ViewHeading />

      <div class="flex flex-col flex-1 items-center justify-center h-full w-full">
        <h1 class="text-2xl font-bold">
          Unauthorized
        </h1>
        <p class="text-gray-500">
          You are not authorized to access this page.
        </p>
      </div>
    </div>
  </MainLayout>
</template>
