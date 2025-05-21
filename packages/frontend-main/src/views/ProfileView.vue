<script setup lang="ts">
import { useRoute } from 'vue-router';

import { usePosts } from '@/composables/usePosts';
import { useTabs } from '@/composables/useTabs';
import { useWallet } from '@/composables/useWallet';

import PostsList from '@/components/posts/PostsList.vue';
import Tab from '@/components/ui/tabs/Tab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';
const wallet = useWallet();

const POSTS_TAB = 'post';
const REPLIES_TAB = 'replies';
const route = useRoute();
const address = typeof route.params.address === 'string' ? route.params.address : '';
const isMyProfile = address === wallet.address.value && !!wallet.loggedIn.value;
const query = usePosts({ userAddress: address });
const { state, setActiveTab } = useTabs({ defaultActiveTab: POSTS_TAB });

</script>

<template>
  <MainLayout>
    <div class="py-6 px-4 flex flex-col">

      <h1 class="hidden xl:inline text-lg font-semibold mb-6 ml-3">
        {{ $t(`components.Titles.${isMyProfile ? 'myProfile' : 'profile'}`) }}
      </h1>

      <UserAvatarUsername :userAddress="address" size="lg" />

      <div class="border-b mt-6" />

      <TabsContainer>
        <Tab :label="$t(`components.Tabs.${isMyProfile ? 'myPosts' : 'posts'}`)" :isActive="state.activeTab === POSTS_TAB"
             :onClick="() => setActiveTab(POSTS_TAB)" />
        <Tab :label="$t(`components.Tabs.${isMyProfile ? 'myReplies' : 'replies'}`)" :isActive="state.activeTab === REPLIES_TAB"
             :onClick="() => setActiveTab(REPLIES_TAB)" />
      </TabsContainer>
    </div>

    <PostsList v-if="state.activeTab === POSTS_TAB" class="border-t" :query="query"/>

  </MainLayout>
</template>
