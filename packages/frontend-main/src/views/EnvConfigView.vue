<script setup lang="ts">
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

import { toast } from 'vue-sonner';
import { debouncedWatch, useColorMode } from '@vueuse/core';
import JsonEditorVue from 'json-editor-vue';
import { ChevronLeft } from 'lucide-vue-next';

import NetworkSelector from '@/components/selects/NetworkSelector.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';

const configStore = useConfigStore();
const mode = useColorMode();

debouncedWatch(configStore.config, () => {
    toast.success('Success', {
        description: 'Config automatically updated',
        duration: 2000,
    });
}, { debounce: 1000 });
</script>

<template>
  <MainLayout>
    <div class="flex flex-col mb-2">
      <div class="flex flex-row items-center border-b py-2 pr-4">
        <RouterLink to="/settings" class="w-32">
          <Button size="sm" class="w-full text-left" variant="link">
            <ChevronLeft class="size-4" />
            <span class="grow">
              {{ $t('components.Settings.back') }}
            </span>
          </Button>
        </RouterLink>
        <h1 class="font-semibold grow text-right select-none">
          {{ $t(`components.Titles.config`) }}
        </h1>
      </div>

      <div class="border-b p-4 mb-4 flex flex-row justify-between">
        <div class="flex flex-row gap-2 items-center justify-evenly w-full">
          <label class="font-semibold text-sm">Current Chain</label>
          <NetworkSelector v-model="configStore.config.selectedChain" />
        </div>
      </div>

      <h1 class="text-lg font-semibold px-4 py-4 text-center">
        {{ $t(`components.Titles.config`) }}
      </h1>

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
          v-model="configStore.envConfig.chainConfig"
          :class="[mode === 'dark' ? 'jse-theme-dark' : 'jse-theme-light']"
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
