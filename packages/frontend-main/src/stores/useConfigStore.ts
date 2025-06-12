import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';

import { envConfigs } from '@/env-config';

interface Config {
    selectedChain: keyof typeof envConfigs;
    envConfigs: typeof envConfigs;
}

const defaultConfig: Config = {
    envConfigs: envConfigs,
    selectedChain: 'testnet',
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
