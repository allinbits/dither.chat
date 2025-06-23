<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useUserReplies } from '@/composables/useUserReplies';

import ProfileViewWrapper from './ProfileViewWrapper.vue';

import RepliesGroupsList from '@/components/posts/RepliesGroupsList.vue';

const route = useRoute();
const address = computed(() =>
    typeof route.params.address === 'string' ? route.params.address : '',
);
const repliesQuery = useUserReplies({ userAddress: address });

</script>

<template>
  <ProfileViewWrapper>
    <RepliesGroupsList :query="repliesQuery" />
  </ProfileViewWrapper>
</template>
