<script setup lang="ts">

import { useFeed } from '@/composables/useFeed';

import HomeViewWrapper from './HomeViewWrapper.vue';

import PostsList from '@/components/posts/PostsList.vue';

const query = useFeed();

</script>

<template>
  <HomeViewWrapper>
    <PostsList :query="query"/>
  </HomeViewWrapper>
</template>
