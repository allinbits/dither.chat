<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Check, ExternalLink } from 'lucide-vue-next';

import ToastWrapper from './ToastWrapper.vue';

import { useConfigStore } from '@/stores/useConfigStore';

const props = defineProps<{
    close: () => void;
    txLabel: string;
    txHash: string;
}>();

const { t } = useI18n();
const configStore = useConfigStore();
const explorerURL = configStore.envConfig.explorerUrl ?? 'https://testnet.explorer.allinbits.services/atomone-devnet-1/tx';

const openExplorer = (event: MouseEvent) => {
    event.stopPropagation(); // Ne ferme pas le toast quand on clique sur le lien
    window.open(`${explorerURL}/${props.txHash}`, '_blank');
};
</script>

<template>
  <ToastWrapper :close="close">
    <Check class="text-green-500" />
    <div>
      <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
        {{ t('components.Toast.success', { txLabel: props.txLabel }) }}
      </div>
      <div
        class="flex items-center gap-2 mt-1 text-sm underline cursor-pointer text-gray-800 dark:text-gray-300"
        @click="openExplorer"
      >
        <span>{{ t('components.Button.viewOnExplorer') }}</span>
        <ExternalLink class="size-4 text-green-500" />
      </div>
    </div>
  </ToastWrapper>
</template>
