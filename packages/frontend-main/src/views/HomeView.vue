<script setup lang="ts">
import { useTabs } from '@/composables/useTabs';

import Feed from '@/components/feed/Feed.vue';
import Tab from '@/components/ui/tabs/Tab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { cn } from '@/utility';

const { state, setActiveTab } = useTabs();
</script>

<template>
  <MainLayout>
    <TabsContainer>
      <Tab label="Global Feed" :isActive="state.activeTab === 1" :onClick="() => setActiveTab(1)"/>
      <Tab label="Following" :isActive="state.activeTab === 2" :onClick="() => setActiveTab(2)"/>
    </TabsContainer>

    <Feed :class="cn(state.activeTab !== 1 && 'hidden')"/>
  </MainLayout>
</template>
