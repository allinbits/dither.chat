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
  minRegisterHandleFee: string;
}

const defaultConfig: Config = {
  envConfigs,
  selectedChain: import.meta.env.VITE_ENVIRONMENT_TYPE ?? 'mainnet',
  defaultAmountAtomics: Decimal.fromUserInput('0.1', fractionalDigits).atomics,
  defaultAmountEnabled: false,
  minRegisterHandleFee: Decimal.fromUserInput(import.meta.env.VITE_MIN_REGISTER_HANDLE_FEE ?? '1', fractionalDigits).atomics,
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
