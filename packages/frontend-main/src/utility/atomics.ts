import { Decimal } from '@cosmjs/math';

export const fractionalDigits = 6;

export function addAtomics(firstAtomicsAmount: string, secondAtomicsAmount: string) {
  return Decimal.fromAtomics(firstAtomicsAmount, 0)
    .plus(Decimal.fromAtomics(secondAtomicsAmount, 0))
    .toString();
}
