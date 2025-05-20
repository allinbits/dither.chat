<script setup lang="ts">
import { useRoute } from 'vue-router';

import { useTabs } from '@/composables/useTabs';
import { useWallet } from '@/composables/useWallet';

import Tab from '@/components/ui/tabs/Tab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';
const wallet = useWallet();

const POSTS_TAB = 'post';
const REPLIES_TAB = 'replies';
const route = useRoute();
const { state, setActiveTab } = useTabs({ defaultActiveTab: POSTS_TAB });
const address = typeof route.query.address === 'string' ? route.query.address : '';
console.log('addressaddress', address);
console.log('wallet.address.value', wallet.address.value);
const isMyProfile = address === wallet.address.value;
</script>

<template>
  <MainLayout>
    <div class="my-6 px-4 flex flex-col gap-6">

      <span class="hidden xl:inline text-lg font-semibold ">{{ `${isMyProfile ? 'My ' : ''}Profile` }}</span>

      <UserAvatarUsername :userAddress="address" size="lg" />

      <div class="border-b" />

      <TabsContainer>
        <Tab :label="$t('components.Tabs.feed')" :isActive="state.activeTab === POSTS_TAB"
             :onClick="() => setActiveTab(POSTS_TAB)" />
        <Tab :label="$t('components.Tabs.following')" :isActive="state.activeTab === REPLIES_TAB"
             :onClick="() => setActiveTab(REPLIES_TAB)" />
      </TabsContainer>

    </div>
  </MainLayout>
</template>
