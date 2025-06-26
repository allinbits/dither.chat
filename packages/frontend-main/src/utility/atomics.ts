import { Decimal } from '@cosmjs/math';

export const addAtomics = (firstAtomicsAmount: string, secondAtomicsAmount: string): number => {
    return Decimal.fromAtomics(firstAtomicsAmount, 0)
        .plus(Decimal.fromAtomics(secondAtomicsAmount, 0))
        .toFloatApproximation();
};

export const atomicsStringToNumber = (atomicsAmount: string): number => {
    return Decimal.fromAtomics(atomicsAmount, 0).toFloatApproximation();
};
