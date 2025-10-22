<script setup lang="ts">
import { h } from 'vue';
import { retrieveLaunchParams } from '@tma.js/sdk-vue';
import AppLink from '@/components/AppLink.vue';
import AppPage from '@/components/AppPage.vue';
import AppDisplayData, { type DisplayDataRow } from '@/components/AppDisplayData.vue';

const lp = retrieveLaunchParams();

const rows: DisplayDataRow[] = [
  { title: 'tgWebAppPlatform', value: lp.tgWebAppPlatform },
  { title: 'tgWebAppShowSettings', value: lp.tgWebAppShowSettings },
  { title: 'tgWebAppVersion', value: lp.tgWebAppVersion },
  { title: 'tgWebAppBotInline', value: lp.tgWebAppBotInline },
  { title: 'tgWebAppStartParam', value: lp.tgWebAppStartParam },
  {
    title: 'tgWebAppData',
    value: { render: () => h(AppLink, { to: { name: 'init-data' } }, { default: () => 'View' }) },
  },
  {
    title: 'tgWebAppThemeParams',
    value: { render: () => h(AppLink, { to: { name: 'theme-params' } }, { default: () => 'View' }) },
  },
];
</script>

<template>
  <AppPage title="Launch Params">
    <template #disclaimer>
      This page displays application
      <AppLink to="https://docs.telegram-mini-apps.com/platform/launch-parameters">
        launch params
      </AppLink>
      .
    </template>
    <AppDisplayData :rows />
  </AppPage>
</template>