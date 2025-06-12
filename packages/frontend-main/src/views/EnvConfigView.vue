<script setup lang="ts">
import { ref, watch } from 'vue';
import JsonEditorVue from 'json-editor-vue';
import { ChevronLeft } from 'lucide-vue-next';

import NetworkSelector from '@/components/selects/NetworkSelector.vue';
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
      <div class="flex flex-row items-center border-b py-2 pr-4">
        <RouterLink to="/settings" class="w-32">
          <Button size="sm" class="w-full text-left" variant="link">
            <ChevronLeft class="size-4" />
            <span class="grow">
              {{ $t('components.Settings.back') }}
            </span>
          </Button>
        </RouterLink>
      </div>

      <div class="border-b p-4 flex flex-row justify-between">
        <NetworkSelector v-model="configStore.config.selectedChain" />

        <div v-if="updatedAt" class="text-sm text-gray-500 mt-2">
          Updated at {{ updatedAt.toLocaleString() }}
        </div>
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Current Network</label>
        <NetworkSelector v-model="configStore.config.selectedChain" />
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Api Root</label>
        <Input v-model="configStore.envConfig.apiRoot" />
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Explorer URL</label>
        <Input v-model="configStore.envConfig.explorerUrl" />
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Community Wallet</label>
        <Input v-model="configStore.envConfig.communityWallet" />
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <label class="font-semibold text-sm">Chain Config</label>
        <JsonEditorVue
          v-model="configStore.chainConfig"
          :mainMenuBar="false"
          :navigationBar="false"
          :statusBar="false"
          :askToFormat="false"
          :readOnly="false"
        />
      </div>

      <div class="flex flex-row gap-2 justify-center mt-4">
        <Button @click="configStore.resetConfig">
          Reset
        </Button>
      </div>

    </div>
  </MainLayout>
</template>
