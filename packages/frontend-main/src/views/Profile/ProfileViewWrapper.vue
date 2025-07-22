<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from 'lucide-vue-next';

import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFollowUser } from '@/composables/useFollowUser';
import { useIsFollowing } from '@/composables/useIsFollowing';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useTipUser } from '@/composables/useTipUser';
import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useWallet } from '@/composables/useWallet';

import ViewHeading from '../ViewHeading.vue';

import Button from '@/components/ui/button/Button.vue';
import RouterLinkTab from '@/components/ui/tabs/RouterLinkTab.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

const wallet = useWallet();
const popups = usePopups();
const { isDefaultAmountInvalid } = useDefaultAmount();
const route = useRoute();
const configStore = useConfigStore();
const { tipUser } = useTipUser();
const { followUser } = useFollowUser();
const { unfollowUser } = useUnfollowUser();

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

async function onClickTip() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else if (configStore.config.defaultAmountEnabled) {
        await tipUser({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    }
    else {
        handleAction('tipUser', address.value);
    }
}
async function onClickFollow() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else if (configStore.config.defaultAmountEnabled) {
        await followUser({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    }
    else {
        handleAction('follow', address.value);
    }
}
async function onClickUnfollow() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else if (configStore.config.defaultAmountEnabled) {
        await unfollowUser({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    }
    else {
        handleAction('unfollow', address.value);
    }
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
            <Button size="sm" @click="onClickTip">
              {{ $t('components.Button.tip') }}
            </Button>

            <Button v-if="isFollowing" size="sm" @click="onClickUnfollow">
              {{ $t('components.Button.unfollow') }}
            </Button>
            <Button v-else size="sm" @click="onClickFollow">
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
