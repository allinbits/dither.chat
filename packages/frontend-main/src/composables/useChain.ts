import { computed } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useConfigStore } from '@/stores/useConfigStore';

export const useChain = () => {
    const defaultDecimals = 6;
    const configStore = useConfigStore();

    const chainConfig = computed(() => configStore.envConfig.chainConfig);

    const getCurrencyCoinDecimals = (coinMinimalDenom: string): number => {
        return (
            chainConfig.value.currencies.find(c => c.coinMinimalDenom === coinMinimalDenom)?.coinDecimals
            ?? defaultDecimals
        );
    };

    const getMinimalCurrencyAmount = (coinMinimalDenom: string): number => {
        const decimals = getCurrencyCoinDecimals(coinMinimalDenom);
        return Decimal.fromUserInput('1', decimals).toFloatApproximation();
    };

    const getAtomicsCurrenyAmount = (coinMinimalDenom: string, photonValue: number): string => {
        const decimals = getCurrencyCoinDecimals(coinMinimalDenom);
        return Decimal.fromUserInput(photonValue.toString(), decimals).atomics;
    };

    return {
        chainConfig,
        getCurrencyCoinDecimals,
        getMinimalCurrencyAmount,
        getAtomicsCurrenyAmount,
    };
};
