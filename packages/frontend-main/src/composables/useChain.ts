import { computed } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useConfigStore } from '@/stores/useConfigStore';

export const useChain = () => {
    const configStore = useConfigStore();

    const chainConfig = computed(() => configStore.envConfig.chainConfig);

    const getCoinDecimals = (coinMinimalDenom: string) => {
        return (
            chainConfig.value.currencies.find(c => c.coinMinimalDenom === coinMinimalDenom)?.coinDecimals
        );
    };

    const getMinimalAmount = (coinMinimalDenom: string) => {
        const decimals = getCoinDecimals(coinMinimalDenom);
        return !decimals ? '0' : Decimal.fromAtomics('1', decimals).toString();
    };

    const getAtomicsAmount = (amount: string, coinMinimalDenom: string) => {
        const decimals = getCoinDecimals(coinMinimalDenom);
        return !decimals ? '0' : Decimal.fromUserInput(amount, decimals).atomics;
    };

    const getAmountFromAtomic = (amount: string, coinMinimalDenom: string) => {
        const decimals = getCoinDecimals(coinMinimalDenom);
        return !decimals ? '0' : Decimal.fromAtomics(amount, decimals).toString();
    };

    return {
        chainConfig,
        getCoinDecimals,
        getMinimalAmount,
        getAtomicsAmount,
        getAmountFromAtomic,
    };
};
