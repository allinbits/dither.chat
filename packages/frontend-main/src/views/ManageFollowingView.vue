<script setup lang="ts">
import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useFollowing } from '@/composables/useFollowing';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import Button from '@/components/ui/button/Button.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import HeaderBack from '@/views/ViewHeading.vue';

const wallet = useWallet();
const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useFollowing({
    userAddress: wallet.address,
});
const flatFollowUsers = computed(() => data.value?.pages.flat() ?? []);

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
  <MainLayout>
    <div class="flex flex-col">
      <HeaderBack :title="$t('components.Headings.manageFollows')" />

      <div class="flex flex-col">
        <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

        <span v-else-if="!flatFollowUsers.length" class="self-center text-md font-semibold text-base mt-10">
          {{ $t('components.FollowingList.empty') }}
        </span>

        <div v-for="(followUser, index) in flatFollowUsers" :key="index"
             class="flex flex-row items-center justify-between p-4 border-b">
          <RouterLink :to="`/profile/${followUser.address}`">
            <UserAvatarUsername :userAddress="followUser.address" />
          </RouterLink>
          <Button @click="handleAction('unfollow', followUser.address)" size="sm" class="w-[100px]">
            {{ $t('components.Button.unfollow') }}
          </Button>
        </div>
        <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center px-4 pb-4 h-[40px]">
          <Loader v-if="isFetchingNextPage" class="animate-spin w-full" />
          <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm"
                  variant="ghost">
            {{ $t('components.Button.showMore') }}
          </Button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
