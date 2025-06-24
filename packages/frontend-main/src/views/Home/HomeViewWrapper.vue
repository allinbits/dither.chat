<script setup lang="ts">
import { useRoute } from 'vue-router';

import { useWallet } from '@/composables/useWallet';

import RouterLinkTab from '@/components/ui/tabs/RouterLinkTab.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const wallet = useWallet();
const route = useRoute();

</script>

<template>
  <MainLayout>
    <div v-if="wallet.loggedIn.value" class='flex flex-row'>
      <RouterLinkTab :label="$t('components.Tabs.feed')" :isActive="route.path === '/'" to="/"/>
      <RouterLinkTab :label="$t('components.Tabs.following')" :isActive="route.path === '/following'" to="/following"/>
    </div>

    <slot/>
  </MainLayout>
</template>
