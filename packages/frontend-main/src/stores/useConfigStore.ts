import { reactive } from 'vue';
import { defineStore } from 'pinia';

interface Config {
    apiRoot: string;
    explorerUrl: string;
    communityWallet: string;
}

const defaultConfig: Config = {
    apiRoot: import.meta.env.VITE_API_ROOT,
    explorerUrl: import.meta.env.VITE_EXPLORER_URL,
    communityWallet: import.meta.env.VITE_COMMUNITY_WALLET,
};

export const useConfigStore = defineStore(
    'configStateStore',
    () => {
        const config = reactive<Config>({ ...defaultConfig });

        const resetConfig = () => {
            Object.assign(config, defaultConfig);
        };

        return { config, resetConfig };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['config'],
        },
    },
);
