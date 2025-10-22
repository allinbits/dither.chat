<script setup lang="ts">
import type { PopupState } from '@/composables/usePopups';
import { Loader } from 'lucide-vue-next';

import { computed, ref } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFollowing } from '@/composables/useFollowing';
import { usePopups } from '@/composables/usePopups';

import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import HeaderBack from '@/views/ViewHeading.vue';

const wallet = useWallet();
const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useFollowing({
  userAddress: wallet.address,
});
const flatFollowingList = computed(() => data.value?.pages.flat() ?? []);

const popups = usePopups();
const walletDialogStore = useWalletDialogStore();
const configStore = useConfigStore();
const { unfollowUser } = useUnfollowUser();
const { isDefaultAmountInvalid } = useDefaultAmount();

function handleAction(type: keyof PopupState, userAddress: string) {
  if (wallet.loggedIn.value) {
    popups.show(type, userAddress);
    return;
  }

  walletDialogStore.showDialog(null, () => {
    popups.show(type, userAddress);
  });
}

async function onClickUnfollow(address: string) {
  if (isDefaultAmountInvalid.value) {
    popups.show('invalidDefaultAmount', 'none');
  } else if (configStore.config.defaultAmountEnabled) {
    await unfollowUser({ userAddress: ref(address), amountAtomics: configStore.config.defaultAmountAtomics });
  } else {
    handleAction('unfollow', address);
  }
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <HeaderBack :title="$t('components.Headings.manageFollows')" />

      <div class="flex flex-col">
        <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

        <span v-else-if="!flatFollowingList.length" class="self-center text-md font-semibold text-base mt-10">
          {{ $t('components.FollowingList.empty') }}
        </span>

        <div
          v-for="(following, index) in flatFollowingList" :key="index"
          class="flex flex-row items-center justify-between p-4 border-b"
        >
          <RouterLink :to="`/profile/${following.address}`">
            <UserAvatarUsername :user-address="following.address" />
          </RouterLink>
          <Button size="sm" class="w-[100px]" @click="onClickUnfollow(following.address)">
            {{ $t('components.Button.unfollow') }}
          </Button>
        </div>
        <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center px-4 pb-4 h-[40px]">
          <Loader v-if="isFetchingNextPage" class="animate-spin w-full" />
          <Button
            v-if="hasNextPage && !isFetchingNextPage" size="sm" class="w-full text-sm" variant="ghost"
            @click="fetchNextPage"
          >
            {{ $t('components.Button.showMore') }}
          </Button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
