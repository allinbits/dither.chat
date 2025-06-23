<script setup lang="ts">
import { useRoute } from 'vue-router';

import { useWallet } from '@/composables/useWallet';

import RouterLinkTab from '@/components/ui/tabs/RouterLinkTab.vue';
import TabsContainer from '@/components/ui/tabs/TabsContainer.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const wallet = useWallet();
const route = useRoute();

</script>

<template>
  <MainLayout>
    <TabsContainer v-if="wallet.loggedIn.value">
      <RouterLinkTab :label="$t('components.Tabs.feed')" :isActive="route.path === '/'" to="/"/>
      <RouterLinkTab :label="$t('components.Tabs.following')" :isActive="route.path === '/following'" to="/following"/>
    </TabsContainer>

    <slot/>
  </MainLayout>
</template>
