<script setup lang="ts">
import Feed from '@/components/ui/Feed.vue';
import MainLayout from '@/layouts/MainLayout.vue';

</script>

<template class="h-screen">
  <MainLayout>
    <div class="min-w-[600px] min-h-full top-0 h-screen">
      <Feed />
    </div>
  </MainLayout>
</template>
