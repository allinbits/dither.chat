<script setup lang="ts">
import type { PopupState } from '@/composables/usePopups';

import { CheckCircle2, ChevronDown, ChevronUp, Circle, Clock, Loader, Twitter, XCircle } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

import Button from '@/components/ui/button/Button.vue';
import Tabs from '@/components/ui/tabs/RouterTabs.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFollowUser } from '@/composables/useFollowUser';
import { useIsFollowing } from '@/composables/useIsFollowing';
import { usePopups } from '@/composables/usePopups';
import { useSocialLinks } from '@/composables/useSocialLinks';
import { useTipUser } from '@/composables/useTipUser';
import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { generateTweetText, getSocialProofCode, getTweetIntentUrl } from '@/utility/social';
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

const { data: isFollowing, isFetching: isFetchingIsFollowing } = useIsFollowing({ followingAddress: address, followerAddress: wallet.address });

// Edit Profile state
const isEditProfileExpanded = ref(true);
const isXRowExpanded = ref(false);
const proofUrl = ref('');
const isClaimLoading = ref(false);

const verificationCode = computed(() =>
  wallet.address.value ? getSocialProofCode(wallet.address.value) : '',
);

// Tweet text and URL
const tweetText = computed(() => generateTweetText(verificationCode.value));
const tweetIntentUrl = computed(() => getTweetIntentUrl(tweetText.value));

// Social links from API — drives the X verification status display
const { data: socialLinksData } = useSocialLinks({ address: wallet.address });
const xLink = computed(() => {
  const links = socialLinksData.value ?? [];
  return links
    .filter(l => l.platform === 'x')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
});

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

async function onClaimX() {
  if (!proofUrl.value.trim()) return;
  isClaimLoading.value = true;
  try {
    // Extract username from proof URL (basic extraction)
    const urlMatch = proofUrl.value.match(/x\.com\/([^/]+)\/status/);
    const username = urlMatch ? urlMatch[1] : 'unknown';

    await wallet.dither.send('LinkSocial', {
      args: [username, 'x', proofUrl.value],
    });

    isXRowExpanded.value = false;
    proofUrl.value = '';
  } catch (error) {
    console.error('Failed to claim X verification:', error);
  } finally {
    isClaimLoading.value = false;
  }
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t(`components.Headings.${isMyProfile ? 'myProfile' : 'profile'}`)" />

      <div class="flex flex-row justify-between items-center p-4">
        <UserAvatarUsername :user-address="address" size="lg" disabled />
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

      <!-- Edit Profile Section (only for own profile) -->
      <div v-if="isMyProfile" class="border-t px-4 py-3">
        <!-- Edit Profile Header (toggle) -->
        <button
          class="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
          @click="isEditProfileExpanded = !isEditProfileExpanded"
        >
          <span>Social Accounts</span>
          <ChevronDown v-if="!isEditProfileExpanded" class="w-4 h-4" />
          <ChevronUp v-else class="w-4 h-4" />
        </button>

        <!-- Collapsible Content -->
        <div v-if="isEditProfileExpanded" class="mt-3 space-y-2">
          <!-- X Social Link Row -->
          <div class="border rounded-lg">
            <!-- No link or failed: button to start / retry -->
            <button
              v-if="!xLink || xLink.status === 'failed'"
              class="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors"
              @click="isXRowExpanded = !isXRowExpanded"
            >
              <div class="flex items-center gap-2">
                <Twitter class="w-4 h-4" />
                <span>{{ xLink?.status === 'failed' ? `Retry X verification` : 'Prove your X account' }}</span>
              </div>
              <XCircle v-if="xLink?.status === 'failed'" class="w-4 h-4 text-destructive" />
              <Circle v-else class="w-4 h-4 text-muted-foreground" />
            </button>

            <!-- Pending State -->
            <div
              v-else-if="xLink.status === 'pending'"
              class="flex items-center justify-between p-3 text-sm"
              title="Your claim has been submitted and is being verified"
            >
              <div class="flex items-center gap-2">
                <Twitter class="w-4 h-4" />
                <span>@{{ xLink.handle.split('@')[0] }}</span>
              </div>
              <Clock class="w-4 h-4 text-yellow-500" />
            </div>

            <!-- Verified State -->
            <div
              v-else-if="xLink.status === 'verified'"
              class="flex items-center justify-between p-3 text-sm"
            >
              <div class="flex items-center gap-2">
                <Twitter class="w-4 h-4" />
                <span>@{{ xLink.handle.split('@')[0] }}</span>
              </div>
              <CheckCircle2 class="w-4 h-4 text-green-500" />
            </div>

            <div v-if="isXRowExpanded && (!xLink || xLink.status === 'failed')" class="px-3 pb-3 space-y-3 border-t">
              <div class="pt-3">
                <p class="text-xs text-muted-foreground mb-1">
                  Your verification code:
                </p>
                <code class="text-sm font-mono bg-muted px-2 py-1 rounded">{{ verificationCode }}</code>
              </div>

              <div>
                <p class="text-xs text-muted-foreground mb-1">
                  Post this to X:
                </p>
                <a
                  :href="tweetIntentUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Twitter class="w-4 h-4" />
                  Tweet it now
                </a>
              </div>

              <div>
                <p class="text-xs text-muted-foreground mb-1">
                  Paste your tweet URL:
                </p>
                <input
                  v-model="proofUrl"
                  type="url"
                  placeholder="https://x.com/yourhandle/status/..."
                  class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                >
              </div>

              <Button
                size="sm"
                :disabled="!proofUrl.trim() || isClaimLoading"
                @click="onClaimX"
              >
                <Loader v-if="isClaimLoading" class="w-4 h-4 animate-spin mr-2" />
                Claim
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs v-if="wallet.loggedIn.value" :tabs="tabs" layout="fill" class="border-t" />
    </div>
    <slot />
  </MainLayout>
</template>
