<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from 'lucide-vue-next';

import { useIsFollowing } from '@/composables/useIsFollowing';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import ViewHeading from '../ViewHeading.vue';

import Button from '@/components/ui/button/Button.vue';
import RouterLinkTab from '@/components/ui/tabs/RouterLinkTab.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

const wallet = useWallet();
const popups = usePopups();

const route = useRoute();
const address = computed(() =>
    typeof route.params.address === 'string' ? route.params.address : '',
);
const isMyProfile = computed(() =>
    address.value === wallet.address.value,
);
const { data: isFollowing, isFetching: isFetchingIsFollowing } = useIsFollowing({ followingAddress: address, followerAddress: wallet.address });

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
      <ViewHeading :title="$t(`components.Headings.${isMyProfile ? 'myProfile' : 'profile'}`)" />

      <div class="flex flex-row justify-between items-center p-4">
        <UserAvatarUsername :userAddress="address" size="lg" disabled/>
        <Loader v-if="isFetchingIsFollowing" class="animate-spin w-[80px]" />
        <template v-else-if="!isMyProfile && wallet.loggedIn.value">
          <div class="flex flex-row gap-2">
            <Button size="sm" @click="popups.show('tipUser', address)">
              {{ $t('components.Button.tip') }}
            </Button>

            <Button v-if="isFollowing" size="sm" @click="handleAction('unfollow', address)">
              {{ $t('components.Button.unfollow') }}
            </Button>
            <Button v-else size="sm" @click="handleAction('follow', address)">
              {{ $t('components.Button.follow') }}
            </Button>
          </div>
        </template>
      </div>

      <div v-if="wallet.loggedIn.value" class='flex flex-row border-t'>
        <RouterLinkTab :label="$t(`components.Tabs.${isMyProfile ? 'myPosts' : 'posts'}`)"
                       :isActive="route.path === `/profile/${address}`"
                       :to="`/profile/${address}`"
        />
        <RouterLinkTab :label="$t(`components.Tabs.${isMyProfile ? 'myReplies' : 'replies'}`)"
                       :isActive="route.path === `/profile/${address}/replies`"
                       :to="`/profile/${address}/replies`"
        />
      </div>
    </div>

    <slot/>
  </MainLayout>
</template>
