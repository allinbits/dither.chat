<script setup lang="ts">
import { computed } from 'vue';
import { initData, useSignal, type User } from '@tma.js/sdk-vue';
import AppLink from '@/components/AppLink.vue';
import AppPage from '@/components/AppPage.vue';
import AppDisplayData, { type DisplayDataRow } from '@/components/AppDisplayData.vue';

const initDataRef = useSignal(initData.state);
const initDataRaw = useSignal(initData.raw);

const initDataRows = computed<DisplayDataRow[] | undefined>(() => {
  if (!initDataRef.value || !initDataRaw.value) {
    return;
  }
  return [
    { title: 'raw', value: initDataRaw.value },
    ...Object.entries(initDataRef.value).reduce<DisplayDataRow[]>((acc, [title, value]) => {
      if (value instanceof Date) {
        acc.push({ title, value: value.toISOString() });
      } else if (!value || typeof value !== 'object') {
        acc.push({ title, value });
      }
      return acc;
    }, []),
  ];
});

const userRows = computed<DisplayDataRow[] | undefined>(() => {
  const user = initDataRef.value?.user;
  return user ? getUserRows(user) : undefined;
});

const receiverRows = computed<DisplayDataRow[] | undefined>(() => {
  const receiver = initDataRef.value?.receiver;
  return receiver ? getUserRows(receiver) : undefined;
});

const chatRows = computed<DisplayDataRow[] | undefined>(() => {
  const chat = initDataRef.value?.chat;
  return chat
    ? Object.entries(chat).map(([title, value]) => ({ title, value }))
    : undefined;
});

function getUserRows(user: User): DisplayDataRow[] {
  return Object.entries(user).map(([title, value]) => ({ title, value }));
}
</script>

<template>
  <AppPage title="Init Data">
    <template #disclaimer>
      This page displays application
      <AppLink to="https://docs.telegram-mini-apps.com/platform/init-data">init data</AppLink>
      .
    </template>
    <i v-if="!initDataRows">Application was launched with missing init data</i>
    <template v-else>
      <div class="init-data-page__section">
        <h2 class="init-data-page__section-title">Init data</h2>
        <AppDisplayData :rows="initDataRows" />
      </div>

      <div class="init-data-page__section">
        <h2 class="init-data-page__section-title">User</h2>
        <i v-if="!userRows">User information missing</i>
        <AppDisplayData v-else :rows="userRows" />
      </div>

      <div class="init-data-page__section">
        <h2 class="init-data-page__section-title">Receiver</h2>
        <i v-if="!receiverRows">Receiver information missing</i>
        <AppDisplayData v-else :rows="receiverRows" />
      </div>

      <div class="init-data-page__section">
        <h2 class="init-data-page__section-title">Chat</h2>
        <i v-if="!chatRows">Chat information missing</i>
        <AppDisplayData v-else :rows="chatRows" />
      </div>
    </template>
  </AppPage>
</template>

<style scoped>
.init-data-page__section + .init-data-page__section {
  margin-top: 12px;
}

.init-data-page__section-title {
  margin-bottom: 4px;
}
</style>