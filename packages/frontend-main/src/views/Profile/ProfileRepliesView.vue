<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import RepliesGroupsList from '@/components/posts/RepliesGroupsList.vue';
import { useUserReplies } from '@/composables/useUserReplies';
import { useResolveProfile } from '@/features/social';

import ProfileViewWrapper from './ProfileViewWrapper.vue';

const route = useRoute();
const identifier = computed(() =>
  typeof route.params.address === 'string' ? route.params.address : '',
);
const { address } = useResolveProfile(identifier);
const repliesQuery = useUserReplies({ userAddress: address });
</script>

<template>
  <ProfileViewWrapper>
    <RepliesGroupsList :query="repliesQuery" />
  </ProfileViewWrapper>
</template>
