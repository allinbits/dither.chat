<script setup lang="ts">
import type { PopupState } from '@/composables/usePopups';

import { Copy, Loader } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

import Button from '@/components/ui/button/Button.vue';
import Tabs from '@/components/ui/tabs/RouterTabs.vue';
import UserAvatar from '@/components/users/UserAvatar.vue';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFollowUser } from '@/composables/useFollowUser';
import { useIsFollowing } from '@/composables/useIsFollowing';
import { usePopups } from '@/composables/usePopups';
import { useTipUser } from '@/composables/useTipUser';
import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { shorten } from '@/utility/text';
import { showBroadcastingToast } from '@/utility/toast';

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
const { data: isFollowing, isFetching: isFetchingIsFollowing } = useIsFollowing({ followingAddress: address, followerAddress: wallet.address });

const isAddressExpanded = ref(false);

function toggleAddress() {
  isAddressExpanded.value = !isAddressExpanded.value;
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(address.value);
    toast.success('Address copied to clipboard');
  } catch {
    toast.error('Failed to copy address');
  }
}

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
      <div class="flex flex-row items-center justify-between gap-4 p-6 border-b">
        <div class="flex flex-row items-center gap-4 flex-1 min-w-0">
          <UserAvatar :user-address="address" size="lg" disabled />

          <div class="flex flex-row items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              class="text-xl font-medium font-mono tracking-wide text-left hover:opacity-70 active:opacity-50 transition-opacity flex-1 min-w-0 justify-start h-auto p-0"
              @click="toggleAddress"
            >
              <span v-if="isAddressExpanded" class="break-all">{{ address }}</span>
              <span v-else>{{ shorten(address, 10, 6) }}</span>
            </Button>

            <Button
              variant="icon"
              size="icon"
              class="p-1.5 shrink-0"
              :aria-label="$t('components.Button.copyAddress')"
              @click.stop="copyAddress"
            >
              <Copy class="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div class="flex items-center shrink-0">
          <Loader v-if="isFetchingIsFollowing" class="animate-spin w-5 h-5" />
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
      </div>

      <Tabs v-if="wallet.loggedIn.value" :tabs="tabs" layout="fill" />
    </div>
    <slot />
  </MainLayout>
</template>
