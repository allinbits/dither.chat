<script setup lang="ts">
import type { PopupState } from '@/composables/usePopups';

import { Loader } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

import Button from '@/components/ui/button/Button.vue';
import { CopyToClipboard } from '@/components/ui/copy';
import Tabs from '@/components/ui/tabs/RouterTabs.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFollowUser } from '@/composables/useFollowUser';
import { useIsFollowing } from '@/composables/useIsFollowing';
import { usePopups } from '@/composables/usePopups';
import { useTipUser } from '@/composables/useTipUser';
import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useWallet } from '@/composables/useWallet';
import SocialAccountsPanel from '@/features/social/components/SocialAccountsPanel.vue';
import { useAddressHandle } from '@/features/social/composables/useAddressHandle';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { getSocialProofCode } from '@/utility/social';
import { shorten } from '@/utility/text';
import { showBroadcastingToast } from '@/utility/toast';

import ViewHeading from '../ViewHeading.vue';

const wallet = useWallet();
const popups = usePopups();
const { isDefaultAmountInvalid } = useDefaultAmount();
const route = useRoute();
const configStore = useConfigStore();
const { tipUser } = useTipUser();
const { followUser } = useFollowUser();
const { unfollowUser } = useUnfollowUser();
const { t } = useI18n();

const address = computed(() =>
  typeof route.params.address === 'string' ? route.params.address : '',
);
const isMyProfile = computed(() =>
  address.value === wallet.address.value,
);
const hasVerifiedHandle = useAddressHandle(address);

const { data: isFollowing, isFetching: isFetchingIsFollowing } = useIsFollowing({ followingAddress: address, followerAddress: wallet.address });

const verificationCode = computed(() =>
  wallet.address.value ? getSocialProofCode(wallet.address.value) : '',
);

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
  } else if (configStore.config.defaultAmountEnabled) {
    const toastId = showBroadcastingToast('Tip');
    try {
      await tipUser({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    } finally {
      toast.dismiss(toastId);
    }
  } else {
    handleAction('tipUser', address.value);
  }
}
async function onClickFollow() {
  if (isDefaultAmountInvalid.value) {
    popups.show('invalidDefaultAmount', 'none');
  } else if (configStore.config.defaultAmountEnabled) {
    const toastId = showBroadcastingToast('Follow');
    try {
      await followUser({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    } finally {
      toast.dismiss(toastId);
    }
  } else {
    handleAction('follow', address.value);
  }
}
async function onClickUnfollow() {
  if (isDefaultAmountInvalid.value) {
    popups.show('invalidDefaultAmount', 'none');
  } else if (configStore.config.defaultAmountEnabled) {
    const toastId = showBroadcastingToast('Unfollow');
    try {
      await unfollowUser({ userAddress: address, amountAtomics: configStore.config.defaultAmountAtomics });
    } finally {
      toast.dismiss(toastId);
    }
  } else {
    handleAction('unfollow', address.value);
  }
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t(`components.Headings.${isMyProfile ? 'myProfile' : 'profile'}`)" />

      <!-- Profile header -->
      <div class="flex flex-row justify-between items-start p-4">
        <div class="flex flex-col gap-1">
          <UserAvatarUsername :user-address="address" size="lg" disabled>
            <CopyToClipboard
              v-if="hasVerifiedHandle"
              :text="address"
              class="text-xs text-muted-foreground font-mono"
              copy-tooltip="Copy full address"
              copied-tooltip="Address copied"
            >
              <span class="">{{ shorten(address) }}</span>
            </CopyToClipboard>
          </UserAvatarUsername>
        </div>
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

      <!-- Social Accounts -->
      <SocialAccountsPanel
        :address="address"
        :verification-code="isMyProfile ? verificationCode : ''"
        :editable="isMyProfile"
      >
        <template v-if="isMyProfile" #helper>
          <p class="text-xs text-muted-foreground">
            Register a username by linking one of your social accounts, then follow the proof instructions to verify ownership.
          </p>
        </template>
      </SocialAccountsPanel>

      <Tabs :tabs="tabs" layout="fill" class="border-t" />
    </div>
    <slot />
  </MainLayout>
</template>
