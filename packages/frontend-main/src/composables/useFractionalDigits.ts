import { defaultMinimalCoinDenom } from '@/utility/atomics';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

export const useFractionalDigits = (coinMinimalDenom = defaultMinimalCoinDenom) => {
    const chainConfig = getChainConfigLazy();
    const currency = chainConfig.value.currencies.find(
        c => c.coinMinimalDenom === coinMinimalDenom,
    );
    if (!currency) {
        throw new Error(`Unknown currency denom: ${coinMinimalDenom}`);
    }
    return currency.coinDecimals;
};
