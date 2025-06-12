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

export const useConfigStore = defineStore(
    'configStateStore',
    () => {
        const config = reactive<Config>({ ...defaultConfig });
        const chainConfig = computed(() => config.envConfigs[config.selectedChain].chainConfig);
        const envConfig = computed(() => config.envConfigs[config.selectedChain]);

        const resetConfig = () => {
            Object.assign(config, defaultConfig);
        };

        return { config, chainConfig, envConfig, resetConfig };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['config'],
        },
    },
);
