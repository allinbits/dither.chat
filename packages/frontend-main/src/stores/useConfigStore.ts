import { Decimal } from '@cosmjs/math';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

import { envConfigs } from '@/env-config';
import { defaultMinimalCoinDenom, getFractionalDigitsFromChainConfig } from '@/utility/atomics';

interface Config {
  selectedChain: keyof typeof envConfigs;
  envConfigs: typeof envConfigs;
  defaultAmountAtomics: string;
  defaultAmountEnabled: boolean;
}

const initialSelectedChain = (import.meta.env.VITE_ENVIRONMENT_TYPE as keyof typeof envConfigs | undefined) ?? 'mainnet';
const initialChainConfig = envConfigs[initialSelectedChain].chainConfig;
const initialFractionalDigits = getFractionalDigitsFromChainConfig(initialChainConfig, defaultMinimalCoinDenom);

const defaultConfig: Config = {
  envConfigs,
  selectedChain: initialSelectedChain,
  defaultAmountAtomics: Decimal.fromUserInput('0.1', initialFractionalDigits).atomics,
  defaultAmountEnabled: false,
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
