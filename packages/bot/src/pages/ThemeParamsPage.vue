<script setup lang="ts">
import { computed } from 'vue';
import { themeParams, useSignal } from '@tma.js/sdk-vue';
import AppDisplayData, { type DisplayDataRow } from '@/components/AppDisplayData.vue';
import AppLink from '@/components/AppLink.vue';
import AppPage from '@/components/AppPage.vue';

const tp = useSignal(themeParams.state);

const rows = computed<DisplayDataRow[]>(() => Object
  .entries(tp.value)
  .map(([title, value]) => ({ title, value })));
</script>

<template>
  <AppPage title="Theme Params">
    <template #disclaimer>
      This page displays current
      <AppLink to="https://docs.telegram-mini-apps.com/platform/theming">theme params
      </AppLink>
      .
    </template>
    <AppDisplayData :rows />
  </AppPage>
</template>