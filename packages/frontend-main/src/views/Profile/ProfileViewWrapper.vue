<script setup lang="ts">
import type { PopupState } from '@/composables/usePopups';

import { Loader } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

import Avatar from '@/components/ui/avatar/Avatar.vue';
import AvatarFallback from '@/components/ui/avatar/AvatarFallback.vue';
import AvatarImage from '@/components/ui/avatar/AvatarImage.vue';
import Button from '@/components/ui/button/Button.vue';
import Tabs from '@/components/ui/tabs/RouterTabs.vue';
import Username from '@/components/users/Username.vue';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFollowUser } from '@/composables/useFollowUser';
import { useIsFollowing } from '@/composables/useIsFollowing';
import { usePopups } from '@/composables/usePopups';
import { useProfileImages } from '@/composables/useProfileImages';
import { useTipUser } from '@/composables/useTipUser';
import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { showBroadcastingToast } from '@/utility/toast';

import ViewHeading from '../ViewHeading.vue';

const wallet = useWallet();
const popups = usePopups();
const route = useRoute();
const configStore = useConfigStore();
const { isDefaultAmountInvalid } = useDefaultAmount();
const { tipUser } = useTipUser();
const { followUser } = useFollowUser();
const { unfollowUser } = useUnfollowUser();
const { t } = useI18n();
const walletDialogStore = useWalletDialogStore();

const address = computed(() =>
  typeof route.params.address === 'string' ? route.params.address : '',
);
const isMyProfile = computed(() => address.value === wallet.address.value);
const { avatarUrl, avatarImageClass } = useProfileImages(address);
const { data: isFollowing, isFetching: isFetchingIsFollowing } = useIsFollowing({ followingAddress: address, followerAddress: wallet.address });

const bannerImage = ref<string | null>(null);
const avatarImage = ref<string | null>(null);

const tabs = computed(() => [
  {
    label: t(`components.Tabs.${isMyProfile.value ? 'myPosts' : 'posts'}`),
    to: `/profile/${address.value}`,
  },
  {
    label: t(`components.Tabs.${isMyProfile.value ? 'myReplies' : 'replies'}`),
    to: `/profile/${address.value}/replies`,
  },
]);

function handleAction(type: keyof PopupState, userAddress: string) {
  if (wallet.loggedIn.value) {
    popups.show(type, userAddress);
    return;
  }
  walletDialogStore.showDialog(null, () => {
    popups.show(type, userAddress);
  });
}

async function handleUserAction(
  action: 'tip' | 'follow' | 'unfollow',
  actionFn: (params: { userAddress: typeof address; amountAtomics: string }) => Promise<unknown>,
) {
  if (isDefaultAmountInvalid.value) {
    popups.show('invalidDefaultAmount', 'none');
    return;
  }

  if (configStore.config.defaultAmountEnabled) {
    const toastId = showBroadcastingToast(action.charAt(0).toUpperCase() + action.slice(1));
    try {
      await actionFn({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    } finally {
      toast.dismiss(toastId);
    }
  } else {
    handleAction(action === 'tip' ? 'tipUser' : action, address.value);
  }
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t(`components.Headings.${isMyProfile ? 'myProfile' : 'profile'}`)" />

      <!-- Banner Section -->
      <div class="relative h-[200px] w-full bg-muted">
        <img
          v-if="bannerImage"
          :src="bannerImage"
          alt="Banner"
          class="h-full w-full object-cover"
        >
      </div>

      <!-- Profile Info Section -->
      <div class="relative px-4 pb-4">
        <!-- Avatar overlapping banner -->
        <div class="relative -mt-16 mb-4 flex items-end justify-between">
          <Avatar class="size-32 border-4 border-background">
            <AvatarImage
              v-if="avatarImage"
              :src="avatarImage"
              alt="Avatar"
            />
            <AvatarImage
              v-else-if="avatarUrl"
              :class="avatarImageClass"
              :src="avatarUrl"
              alt="user-avatar-image"
            />
            <AvatarFallback class="bg-muted" />
          </Avatar>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 pb-2">
            <Loader v-if="isFetchingIsFollowing" class="animate-spin size-5" />
            <template v-else-if="isMyProfile && wallet.loggedIn.value">
              <Button variant="outline" size="sm" class="rounded-full" @click="popups.show('editProfile', {})">
                {{ $t('components.Button.editProfile') }}
              </Button>
            </template>
            <template v-else-if="!isMyProfile && wallet.loggedIn.value">
              <Button variant="outline" size="sm" class="rounded-full" @click="handleUserAction('tip', tipUser)">
                {{ $t('components.Button.tip') }}
              </Button>
              <Button
                v-if="isFollowing"
                variant="outline"
                size="sm"
                class="rounded-full"
                @click="handleUserAction('unfollow', unfollowUser)"
              >
                {{ $t('components.Button.unfollow') }}
              </Button>
              <Button
                v-else
                variant="outline"
                size="sm"
                class="rounded-full"
                @click="handleUserAction('follow', followUser)"
              >
                {{ $t('components.Button.follow') }}
              </Button>
            </template>
          </div>
        </div>

        <!-- Username -->
        <div class="mb-4">
          <Username :user-address="address" size="lg" />
        </div>
      </div>

      <Tabs v-if="wallet.loggedIn.value" :tabs="tabs" layout="fill" class="border-t" />
    </div>
    <slot />
  </MainLayout>
</template>
