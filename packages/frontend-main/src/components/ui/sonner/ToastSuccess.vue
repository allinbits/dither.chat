<script setup lang="ts">
import { Check, ExternalLink } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

import { useConfigStore } from '@/stores/useConfigStore';

import ToastWrapper from './ToastWrapper.vue';

const props = defineProps<{
  close: () => void;
  txLabel: string;
  txHash: string;
}>();

const { t } = useI18n();
const configStore = useConfigStore();
const explorerURL = configStore.envConfig.explorerUrl ?? 'https://testnet.explorer.allinbits.services/atomone-devnet-1/tx';

function openExplorer(event: MouseEvent) {
  event.stopPropagation(); // Keep the toast open when clicking the link
  window.open(`${explorerURL}/${props.txHash}`, '_blank');
}
</script>

<template>
  <ToastWrapper :close="close" class="min-w-[230px]">
    <div class="size-6">
      <Check class="text-green-500" />
    </div>
    <div>
      <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
        {{ t('components.Toast.success', { txLabel: props.txLabel }) }}
      </div>
      <button
        class="flex items-center gap-2 mt-1 text-sm underline cursor-pointer text-gray-800 dark:text-gray-300"
        @click="openExplorer"
      >
        <span>{{ t('components.Button.viewOnExplorer') }}</span>
        <ExternalLink class="size-4 text-green-500" />
      </button>
    </div>
  </ToastWrapper>
</template>
