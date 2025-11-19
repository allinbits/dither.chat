import { defaultMinimalCoinDenom, getFractionalDigitsFromChainConfig } from '@/utility/atomics';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

export function useFractionalDigits(coinMinimalDenom = defaultMinimalCoinDenom) {
  const chainConfig = getChainConfigLazy();
  return getFractionalDigitsFromChainConfig(chainConfig.value, coinMinimalDenom);
}
