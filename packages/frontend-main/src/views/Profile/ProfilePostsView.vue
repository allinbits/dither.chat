<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import PostsList from '@/components/posts/PostsList.vue';
import { useUserPosts } from '@/composables/useUserPosts';
import { useResolveProfile } from '@/features/social';

import ProfileViewWrapper from './ProfileViewWrapper.vue';

const route = useRoute();
const identifier = computed(() =>
  typeof route.params.address === 'string' ? route.params.address : '',
);
const { address } = useResolveProfile(identifier);
const postsQuery = useUserPosts({ userAddress: address });
</script>

<template>
  <ProfileViewWrapper>
    <PostsList :query="postsQuery" />
  </ProfileViewWrapper>
</template>
