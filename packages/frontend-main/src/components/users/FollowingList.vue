<script setup lang="ts">
import { useFollowing } from '@/composables/useFollowing';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import Button from '../ui/button/Button.vue';

import UserAvatarUsername from './UserAvatarUsername.vue';

import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

const props = defineProps<{ userAddress: string }>();
const { data, isLoading } = useFollowing({
    userAddress: props.userAddress,
});

const wallet = useWallet();
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
  <div class="px-4 pb-10 pt-4">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <span v-else-if="!data.length" class="text-md font-semibold text-base">{{ $t('components.FollowingList.empty') }}</span>

    <div v-else class="flex flex-col gap-4">
      <div v-for="(followUser, index) in data" :key="index" class="flex flex-row items-center justify-between">
        <UserAvatarUsername :userAddress="followUser.address"/>
        <Button @click="handleAction('unfollow', followUser.address)" size="sm" class="w-[160px]">{{ $t('components.Button.unfollow') }}</Button>
      </div>
    </div>

    <!-- TODO: "Show more" button? -->
  </div>
</template>
