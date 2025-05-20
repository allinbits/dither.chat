<script setup lang="ts">
import { useTabs } from '@/composables/useTabs';

import Feed from '@/components/feed/Feed.vue';
import Tab from '@/components/ui/tabs/Tab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { cn } from '@/utility';
const FEED_TAB = 'feed';
const FOLLOWING_TAB = 'following';
const { state, setActiveTab } = useTabs({ defaultActiveTab: FEED_TAB });

</script>

<template>
  <MainLayout>
    <TabsContainer>
      <Tab :label="$t('components.Tabs.feed')" :isActive="state.activeTab === FEED_TAB" :onClick="() => setActiveTab(FEED_TAB)"/>
      <Tab :label="$t('components.Tabs.following')" :isActive="state.activeTab === FOLLOWING_TAB" :onClick="() => setActiveTab(FOLLOWING_TAB)"/>
    </TabsContainer>

    <Feed :class="cn(state.activeTab !== FEED_TAB && 'hidden', 'border-t')"/>
  </MainLayout>
</template>
