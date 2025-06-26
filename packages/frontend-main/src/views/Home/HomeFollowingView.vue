<script setup lang="ts">

import { useFollowingPosts } from '@/composables/useFollowingPosts';
import { useWallet } from '@/composables/useWallet';

import HomeViewWrapper from './HomeViewWrapper.vue';

import PostsList from '@/components/posts/PostsList.vue';
const wallet = useWallet();
const postsQuery = useFollowingPosts({ userAddress: wallet.address });
</script>

<template>
  <HomeViewWrapper>
    <PostsList :query="postsQuery" :emptyText="$t('components.FollowingList.empty')" />
  </HomeViewWrapper>
</template>
