<script setup lang="ts">
import PostsList from '@/components/posts/PostsList.vue';
import { useFollowingPosts } from '@/composables/useFollowingPosts';

import { useWallet } from '@/composables/useWallet';

import HomeViewWrapper from './HomeViewWrapper.vue';

const wallet = useWallet();
const postsQuery = useFollowingPosts({ userAddress: wallet.address });
</script>

<template>
  <HomeViewWrapper>
    <PostsList :query="postsQuery" :empty-text="$t('components.FollowingList.empty')" />
  </HomeViewWrapper>
</template>
