<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from 'lucide-vue-next';

import { useIsFollowing } from '@/composables/useIsFollowing';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useTabs } from '@/composables/useTabs';
import { useUserPosts } from '@/composables/useUserPosts';
import { useUserReplies } from '@/composables/useUserReplies';
import { useWallet } from '@/composables/useWallet';

import PostsList from '@/components/posts/PostsList.vue';
import RepliesGroupsList from '@/components/posts/RepliesGroupsList.vue';
import Button from '@/components/ui/button/Button.vue';
import Tab from '@/components/ui/tabs/Tab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

const wallet = useWallet();
const popups = usePopups();

const POSTS_TAB = 'post';
const REPLIES_TAB = 'replies';
const { state, setActiveTab } = useTabs({ defaultActiveTab: POSTS_TAB });

const route = useRoute();
const address = computed(() =>
    typeof route.params.address === 'string' ? route.params.address : '',
);
const isMyProfile = computed(() =>
    address.value === wallet.address.value,
);
const { data: isFollowing, isFetching: isFetchingIsFollowing } = useIsFollowing({ followingAddress: address, followerAddress: wallet.address });
const postsQuery = useUserPosts({ userAddress: address });
const repliesQuery = useUserReplies({ userAddress: address });

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
    <div class="mt-6 px-4 flex flex-col">

      <h1 class="hidden xl:inline text-lg font-semibold mb-6 ml-3">
        {{ $t(`components.Titles.${isMyProfile ? 'myProfile' : 'profile'}`) }}
      </h1>

      <div class="flex flex-row justify-between items-center">
        <UserAvatarUsername :userAddress="address" size="lg" />
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

      <div class="border-b mt-6" />

      <TabsContainer>
        <Tab :label="$t(`components.Tabs.${isMyProfile ? 'myPosts' : 'posts'}`)"
             :isActive="state.activeTab === POSTS_TAB" :onClick="() => setActiveTab(POSTS_TAB)" />
        <Tab :label="$t(`components.Tabs.${isMyProfile ? 'myReplies' : 'replies'}`)"
             :isActive="state.activeTab === REPLIES_TAB" :onClick="() => setActiveTab(REPLIES_TAB)" />
      </TabsContainer>
    </div>

    <PostsList v-if="state.activeTab === POSTS_TAB" :query="postsQuery"/>
    <RepliesGroupsList v-if="state.activeTab === REPLIES_TAB" :query="repliesQuery" />
  </MainLayout>
</template>
