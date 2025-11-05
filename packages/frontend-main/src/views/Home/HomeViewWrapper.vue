<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Tabs from '@/components/ui/tabs/Tabs.vue';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';

const wallet = useWallet();
const { t } = useI18n();

const tabs = computed(() => [
  {
    label: t('components.Tabs.feed'),
    to: '/',
  },
  {
    label: t('components.Tabs.following'),
    to: '/following',
  },
]);
</script>

<template>
  <MainLayout>
    <Tabs v-if="wallet.loggedIn.value" :tabs="tabs" size="lg" layout="fill" />

    <slot />
  </MainLayout>
</template>
