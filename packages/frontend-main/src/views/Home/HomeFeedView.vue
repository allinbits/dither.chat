<script setup lang="ts">
import PostsList from '@/components/posts/PostsList.vue';

import { useFeed } from '@/composables/useFeed';

import HomeViewWrapper from './HomeViewWrapper.vue';

const query = useFeed();
</script>

<template>
  <HomeViewWrapper>
    <PostsList :query="query" />
  </HomeViewWrapper>
</template>
