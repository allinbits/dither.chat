<script setup lang="ts">
import { useFeed } from '@/composables/useFeed';
import { useTabs } from '@/composables/useTabs';
import { useWallet } from '@/composables/useWallet';

import PostsList from '@/components/posts/PostsList.vue';
import Tab from '@/components/ui/tabs/Tab.vue';
import UserFollowing from '@/components/users/UserFollowing.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const FEED_TAB = 'feed';
const FOLLOWING_TAB = 'following';
const { state, setActiveTab } = useTabs({ defaultActiveTab: FEED_TAB });
const wallet = useWallet();
const query = useFeed();

</script>

<template>
  <MainLayout>
    <div v-if="wallet.loggedIn.value" class='flex flex-row'>
      <Tab :label="$t('components.Tabs.feed')" :isActive="state.activeTab === FEED_TAB" :onClick="() => setActiveTab(FEED_TAB)"/>
      <Tab :label="$t('components.Tabs.following')" :isActive="state.activeTab === FOLLOWING_TAB" :onClick="() => setActiveTab(FOLLOWING_TAB)"/>
    </div>

    <PostsList v-if="state.activeTab === FEED_TAB" :query="query"/>
    <UserFollowing v-if="wallet.loggedIn.value && state.activeTab === FOLLOWING_TAB"/>
  </MainLayout>
</template>
