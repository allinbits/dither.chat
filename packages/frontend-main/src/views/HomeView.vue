<script setup lang="ts">
import { useFeed } from '@/composables/useFeed';
import { useTabs } from '@/composables/useTabs';

import PostsList from '@/components/posts/PostsList.vue';
import Tab from '@/components/ui/tabs/Tab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import MainLayout from '@/layouts/MainLayout.vue';
const FEED_TAB = 'feed';
const FOLLOWING_TAB = 'following';
const { state, setActiveTab } = useTabs({ defaultActiveTab: FEED_TAB });

// const { data: posts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
const query = useFeed();

</script>

<template>
  <MainLayout>
    <TabsContainer>
      <Tab :label="$t('components.Tabs.feed')" :isActive="state.activeTab === FEED_TAB" :onClick="() => setActiveTab(FEED_TAB)"/>
      <Tab :label="$t('components.Tabs.following')" :isActive="state.activeTab === FOLLOWING_TAB" :onClick="() => setActiveTab(FOLLOWING_TAB)"/>
    </TabsContainer>

    <PostsList v-if="state.activeTab === FEED_TAB" class="border-t" :query="query"/>
  </MainLayout>
</template>
