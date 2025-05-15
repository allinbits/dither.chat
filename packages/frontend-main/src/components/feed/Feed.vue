<script lang="ts" setup>

import { useFeed } from '@/composables/useFeed';

import PostItem from './PostItem.vue';

const { data } = useFeed();

</script>

<template >
  <div class="flex flex-col w-full gap-4 md:border-x border-x-neutral-200">
    <div v-for="(post, index) in data" :key="index" class="flex flex-col border-b py-4 px-4">
      <PostItem :post="post"/>
    </div>
  </div>
</template>
