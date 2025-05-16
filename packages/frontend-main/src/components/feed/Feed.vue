<script lang="ts" setup>

import { useFeed } from '@/composables/useFeed';

import PostItem from './PostItem.vue';

const { data } = useFeed();

</script>

<template >
  <div class="flex flex-col w-full gap-4">
    <PostItem v-for="(post, index) in data" :key="index" :post="post" class="p-4"/>
  </div>
</template>
