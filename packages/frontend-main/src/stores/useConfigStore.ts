import { Decimal } from '@cosmjs/math';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

import { envConfigs } from '@/env-config';
import { fractionalDigits } from '@/utility/atomics';

interface Config {
  selectedChain: keyof typeof envConfigs;
  envConfigs: typeof envConfigs;
  defaultAmountAtomics: string;
  defaultAmountEnabled: boolean;
  regularSendAmountAtomics: string;
  promotionSendAmountAtomics: string;
}

const defaultConfig: Config = {
  envConfigs,
  selectedChain: import.meta.env.VITE_ENVIRONMENT_TYPE ?? 'mainnet',
  defaultAmountAtomics: Decimal.fromUserInput('0.1', fractionalDigits).atomics,
  defaultAmountEnabled: false,
  regularSendAmountAtomics: import.meta.env.VITE_DEFAULT_SEND_AMOUNT_ATOMICS,
  promotionSendAmountAtomics: import.meta.env.VITE_PROMOTION_SEND_AMOUNT_ATOMICS,
};

// deep clone the default config to avoid mutating the original object
const initConfig = structuredClone(defaultConfig);

export const useConfigStore = defineStore(
  'configStateStore',
  () => {
    const config = reactive<Config>(initConfig);
    const envConfig = computed(() => config.envConfigs[config.selectedChain]);

    const resetConfig = () => {
      Object.assign(config, defaultConfig);
    };

    return { config, envConfig, resetConfig };
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['config'],
    },
  },
);
