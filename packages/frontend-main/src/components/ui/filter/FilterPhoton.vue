<script setup lang="ts">
import { computed } from 'vue';
import { Decimal } from '@cosmjs/math';

import { Slider } from '@/components/ui/slider';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { fractionalDigits } from '@/utility/atomics';
import { formatCompactAtomics } from '@/utility/text';

const store = useFiltersStore();

const minDecimal = Decimal.fromAtomics('1', fractionalDigits);
const maxDecimal = Decimal.fromUserInput('100', fractionalDigits);
const stepDecimal = Decimal.fromAtomics('1', fractionalDigits);

const min = computed(() => minDecimal.toFloatApproximation());
const max = computed(() => maxDecimal.toFloatApproximation());
const step = computed(() => stepDecimal.toFloatApproximation());

const minFloat = minDecimal.toFloatApproximation();
const maxFloat = maxDecimal.toFloatApproximation();
const logMin = Math.log10(minFloat);
const logMax = Math.log10(maxFloat);
const logOne = 0;

const sliderValue = computed({
    get: () => [inverseExponentialScale(Decimal.fromAtomics(store.filterAmountAtomics, fractionalDigits))],
    set: val => store.setFilterAmountAtomics(exponentialScale(val[0]).atomics),
});

const displayValue = computed(() => formatCompactAtomics(store.filterAmountAtomics, fractionalDigits));

function exponentialScale(value: number): Decimal {
    const t = value / maxFloat;
    const logValue = t < 0.5
        ? logMin + (logOne - logMin) * (t / 0.5)
        : logOne + (logMax - logOne) * ((t - 0.5) / 0.5);
    const result = Math.pow(10, logValue);
    return Decimal.fromUserInput(result.toFixed(fractionalDigits), fractionalDigits);
}

function inverseExponentialScale(amount: Decimal): number {
    const amountFloat = amount.toFloatApproximation();
    if (amountFloat <= 0) return 0;
    const logAmount = Math.log10(amountFloat);
    const t = logAmount < logOne
        ? (logAmount - logMin) / (logOne - logMin) * 0.5
        : 0.5 + (logAmount - logOne) / (logMax - logOne) * 0.5;
    return t * maxFloat;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <label class="font-semibold text-sm">{{ $t('components.Filter.posts') }}</label>
    <Slider :min="min" :max="max" :step="step" v-model="sliderValue" class="cursor-pointer"/>
    <span class="text-sm">
      {{ $t('components.Filter.amount') + ': ' + displayValue }}
    </span>
  </div>
</template>
