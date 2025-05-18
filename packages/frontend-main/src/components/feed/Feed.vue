<script lang="ts" setup>

import { Loader } from 'lucide-vue-next';

import { useFeed } from '@/composables/useFeed';

import Button from '../ui/button/Button.vue';

import PostItem from './PostItem.vue';

const { data: posts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();

</script>

<template >
  <div class="flex flex-col w-full  gap-4">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10"/>

    <PostItem v-for="(post, index) in posts" :key="index" :post="post" class="p-4"/>

    <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center mb-4 px-4 h-[40px]">
      <Loader v-if="isFetchingNextPage" class="animate-spin "/>
      <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm" variant="ghost">
        Show more
      </Button>
    </div>
  </div>
</template>
