<script setup lang="ts">
import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useFollowing } from '@/composables/useFollowing';
import { useFollowingPosts } from '@/composables/useFollowingPosts';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import PostsList from '../posts/PostsList.vue';
import Button from '../ui/button/Button.vue';

import UserAvatarUsername from './UserAvatarUsername.vue';

import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

const wallet = useWallet();
const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useFollowing({
    userAddress: wallet.address,
});
const flatFollowUsers = computed(() => data.value?.pages.flat() ?? []);
const postsQuery = useFollowingPosts({ userAddress: wallet.address });
const popups = usePopups();
const walletDialogStore = useWalletDialogStore();

function handleAction(type: keyof PopupState, userAddress: string) {
    if (wallet.loggedIn.value) {
        popups.show(type, userAddress);
        return;
    }

    walletDialogStore.showDialog(null, () => {
        popups.show(type, userAddress);
    });
}

</script>

<template>
  <div class="flex flex-col w-full">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <span v-else-if="!flatFollowUsers.length" class="self-center text-md font-semibold text-base pt-4 pb-6">{{
      $t('components.FollowingList.empty') }}</span>

    <!-- Following users -->
    <div v-else class="flex flex-col gap-4 px-4 pt-4">
      <div v-for="followUser in flatFollowUsers" :key="followUser.address"
           class="flex flex-row items-center justify-between last:pb-6">
        <RouterLink :to="`/profile/${followUser.address}`">
          <UserAvatarUsername :userAddress="followUser.address" />
        </RouterLink>
        <Button @click="handleAction('unfollow', followUser.address)" size="sm" class="w-[160px]">{{
          $t('components.Button.unfollow') }}</Button>
      </div>

      <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center px-4 pb-4 h-[40px]">
        <Loader v-if="isFetchingNextPage" class="animate-spin w-full" />
        <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm"
                variant="ghost">
          {{ $t('components.Button.showMore') }}
        </Button>
      </div>
    </div>

    <!-- Posts of following users -->
    <PostsList :query="postsQuery" hideEmptyText />
  </div>
</template>
