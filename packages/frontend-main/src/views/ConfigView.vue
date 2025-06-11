<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';

const configStore = useConfigStore();
const updatedAt = ref<Date | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;

watch(configStore.config, () => {
    updatedAt.value = new Date();

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        updatedAt.value = null;
    }, 2_000);
});
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <div class="border-b p-4 flex flex-row justify-between">
        <h1 class="text-lg font-semibold ">
          {{ $t(`components.Titles.config`) }}
        </h1>

        <div v-if="updatedAt" class="text-sm text-gray-500 mt-2">
          Updated at {{ updatedAt.toLocaleString() }}
        </div>
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Api Root</label>
        <Input v-model="configStore.config.apiRoot" />
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Explorer URL</label>
        <Input v-model="configStore.config.explorerUrl" />
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Community Wallet</label>
        <Input v-model="configStore.config.communityWallet" />
      </div>

      <div class="flex flex-row gap-2 justify-center mt-4">
        <Button @click="configStore.resetConfig">
          Reset
        </Button>
      </div>

    </div>
  </MainLayout>
</template>
