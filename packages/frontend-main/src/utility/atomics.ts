import { Decimal } from '@cosmjs/math';

export const defaultFractionalDigits = 0;
export const defaultMinimalCoinDenom = 'uphoton';

export function addAtomics(firstAtomicsAmount: string, secondAtomicsAmount: string) {
  return Decimal.fromAtomics(firstAtomicsAmount, 0)
    .plus(Decimal.fromAtomics(secondAtomicsAmount, 0))
    .toString();
}

interface ChainCurrency {
  coinMinimalDenom: string;
  coinDecimals: number;
}

interface ChainConfigLike {
  currencies?: ChainCurrency[];
}

export function getFractionalDigitsFromChainConfig(
  chainConfig: ChainConfigLike | undefined,
  coinMinimalDenom = defaultMinimalCoinDenom,
) {
  if (!chainConfig?.currencies?.length) {
    return defaultFractionalDigits;
  }

  const currency = chainConfig.currencies.find(c => c.coinMinimalDenom === coinMinimalDenom);
  return currency?.coinDecimals ?? defaultFractionalDigits;
}
