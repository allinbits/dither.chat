import { getChainConfigLazy } from './getChainConfigLazy';

export const getCurrencyCoinDecimals = (coinDenom: string) => {
    const chainConfig = getChainConfigLazy();
    const currency = chainConfig.value.currencies.find(c => c.coinDenom === coinDenom);
    if (!currency) return;
    return currency.coinDecimals;
};

export const getMinimalCurrencyAmount = (coinDenom: string) => {
    const coinDecimals = getCurrencyCoinDecimals(coinDenom) ?? 6;
    return 10 ** -coinDecimals;
};
