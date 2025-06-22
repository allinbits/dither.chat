import { computed } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';

export const useChain = () => {
    const configStore = useConfigStore();
    const chainConfig = computed(() => configStore.envConfig.chainConfig);

    const getCurrencyCoinDecimals = (coinDenom: string) => {
        const currency = chainConfig.value.currencies.find(c => c.coinDenom === coinDenom);
        if (!currency) return;
        return currency.coinDecimals;
    };

    const getMinimalCurrencyAmount = (coinDenom: string) => {
        const coinDecimals = getCurrencyCoinDecimals(coinDenom) ?? 6;
        return 10 ** -coinDecimals;
    };

    const getAtomicCurrencyAmount = (coinDenom: string, amount: number) => {
        const coinDecimals = getCurrencyCoinDecimals(coinDenom) ?? 6;
        return Math.floor(amount * 10 ** coinDecimals);
    };

    return { chainConfig, getCurrencyCoinDecimals, getMinimalCurrencyAmount, getAtomicCurrencyAmount };
};
