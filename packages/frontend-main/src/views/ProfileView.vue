<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

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

const wallet = useWallet();

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

// TODO:
const isFollowing = false;

const postsQuery = useUserPosts({ userAddress: address });
const repliesQuery = useUserReplies({ userAddress: address });
</script>

<template>
  <MainLayout>
    <div class="mt-6 px-4 flex flex-col">

      <h1 class="hidden xl:inline text-lg font-semibold mb-6 ml-3">
        {{ $t(`components.Titles.${isMyProfile ? 'myProfile' : 'profile'}`) }}
      </h1>

      <div class="flex flex-row justify-between items-center">
        <UserAvatarUsername :userAddress="address" size="lg" />
        <template v-if="!isMyProfile && wallet.loggedIn.value">
          <Button v-if="isFollowing" size="sm">
            {{ $t('components.Button.unfollow') }}
          </Button>
          <Button v-else size="sm">
            {{ $t('components.Button.follow') }}
          </Button>
        </template>

      </div>

      <div class="border-b mt-6" />

      <TabsContainer>
        <Tab :label="$t(`components.Tabs.${isMyProfile ? 'myPosts' : 'posts'}`)" :isActive="state.activeTab === POSTS_TAB"
             :onClick="() => setActiveTab(POSTS_TAB)" />
        <Tab :label="$t(`components.Tabs.${isMyProfile ? 'myReplies' : 'replies'}`)" :isActive="state.activeTab === REPLIES_TAB"
             :onClick="() => setActiveTab(REPLIES_TAB)" />
      </TabsContainer>
    </div>

    <PostsList v-if="state.activeTab === POSTS_TAB" :query="postsQuery"/>
    <RepliesGroupsList v-if="state.activeTab === REPLIES_TAB" :query="repliesQuery"/>
  </MainLayout>
</template>
