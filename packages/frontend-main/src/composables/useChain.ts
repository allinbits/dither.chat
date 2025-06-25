import { computed } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useConfigStore } from '@/stores/useConfigStore';

export const useChain = () => {
    const configStore = useConfigStore();

    const chainConfig = computed(() => configStore.envConfig.chainConfig);

    const defaultCoinDecimals = chainConfig.value.stakeCurrency.coinDecimals;
    const getCoinDecimals = (coinMinimalDenom?: string): number => {
        console.log('defaultCoinDecimals', defaultCoinDecimals);
        return (
            chainConfig.value.currencies.find(c => c.coinMinimalDenom === coinMinimalDenom)?.coinDecimals
            ?? defaultCoinDecimals
        );
    };

    const getMinimalAmount = (coinMinimalDenom?: string): number => {
        const decimals = getCoinDecimals(coinMinimalDenom);
        return Decimal.fromAtomics('1', decimals).toFloatApproximation();
    };

    const getAtomicsAmount = (photonValue: number, coinMinimalDenom?: string): string => {
        const decimals = getCoinDecimals(coinMinimalDenom);
        return Decimal.fromUserInput(photonValue.toString(), decimals).atomics;
    };

    const getAmountFromAtomic = (photonValue: number, coinMinimalDenom?: string): string => {
        const decimals = getCoinDecimals(coinMinimalDenom);
        return Decimal.fromAtomics(photonValue.toString(), decimals).toString();
    };

    return {
        chainConfig,
        getCoinDecimals,
        getMinimalAmount,
        getAtomicsAmount,
        getAmountFromAtomic,
    };
};
