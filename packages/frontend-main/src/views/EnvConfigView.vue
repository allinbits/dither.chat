<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';
import JsonEditorVue from 'json-editor-vue';
import { computed } from 'vue';

import NetworkSelector from '@/components/selects/NetworkSelector.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useColorTheme } from '@/composables/useColorTheme';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { showInfoToast } from '@/utility/toast';
import HeaderBack from '@/views/ViewHeading.vue';

import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

const configStore = useConfigStore();
const { theme } = useColorTheme();
const isDarkMode = computed(() => theme.value === 'dark' || theme.value === 'atomone');

debouncedWatch(configStore.config, () => {
  showInfoToast('Settings Updated', 'Config automatically updated');
}, { debounce: 1000 });
</script>

<template>
  <MainLayout>
    <div class="flex flex-col mb-2">
      <HeaderBack :title="$t('components.Headings.envConfig')" />

      <div class="border-b p-4 mb-4 flex flex-row justify-between">
        <div class="flex flex-row gap-2 items-center justify-evenly w-full">
          <label class="font-semibold text-sm">Current Chain</label>
          <NetworkSelector v-model="configStore.config.selectedChain" />
        </div>
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
          v-model="configStore.envConfig.chainConfig"
          :class="[isDarkMode ? 'jse-theme-dark' : 'jse-theme-light']"
          :main-menu-bar="false"
          :navigation-bar="false"
          :status-bar="false"
          :ask-to-format="false"
          :read-only="false"
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
