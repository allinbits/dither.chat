<script setup lang="ts">
import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useFollowing } from '@/composables/useFollowing';
import { useFollowingPosts } from '@/composables/useFollowingPosts';
import { useWallet } from '@/composables/useWallet';

import PostsList from '../posts/PostsList.vue';

const wallet = useWallet();
const { data, isLoading } = useFollowing({
    userAddress: wallet.address,
});
const flatFollowUsers = computed(() => data.value?.pages.flat() ?? []);
const postsQuery = useFollowingPosts({ userAddress: wallet.address });

</script>

<template>
  <div class="flex flex-col w-full">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <span v-else-if="!flatFollowUsers.length" class="self-center text-md font-semibold text-base pt-4 pb-6">
      {{ $t('components.FollowingList.empty') }}
    </span>

    <!-- Posts of following users -->
    <PostsList :query="postsQuery" hideEmptyText />
  </div>
</template>
