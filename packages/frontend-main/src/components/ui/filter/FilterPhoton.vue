<script setup lang="ts">
import { computed } from 'vue';
import { Decimal } from '@cosmjs/math';

import { Slider } from '@/components/ui/slider';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { fractionalDigits } from '@/utility/atomics';
import { formatCompactAtomics } from '@/utility/text';

const store = useFiltersStore();

const min = computed(() => Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const step = computed(() => Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const max = computed(() =>
    Decimal.fromUserInput('100', fractionalDigits).toFloatApproximation(),
);

const sliderValue = computed({
    get: () => [inverseExponentialScale(Decimal.fromAtomics(store.filterAmountAtomics, fractionalDigits).toFloatApproximation())],
    set: (val) => {
        const eS = exponentialScale(val[0]);
        return store.setFilterAmountAtomics(
            Decimal.fromUserInput(eS.toFixed(fractionalDigits), fractionalDigits).atomics,
        );
    },
});

const displayValue = computed(() => formatCompactAtomics(store.filterAmountAtomics, fractionalDigits));

function exponentialScale(value: number) {
    const t = value / max.value;
    const logMin = Math.log10(min.value);
    const logOne = 0;
    const logMax = Math.log10(max.value);
    const logValue = t < 0.5
        ? logMin + (logOne - logMin) * (t / 0.5)
        : logOne + (logMax - logOne) * ((t - 0.5) / 0.5);
    const result = Math.pow(10, logValue);
    return Math.round(result / min.value) * min.value;
}
function inverseExponentialScale(amount: number) {
    if (amount <= 0) return 0;
    const logAmount = Math.log10(amount);
    const logMin = Math.log10(min.value);
    const logOne = 0;
    const logMax = Math.log10(max.value);
    const t = logAmount < logOne
        ? (logAmount - logMin) / (logOne - logMin) * 0.5
        : 0.5 + (logAmount - logOne) / (logMax - logOne) * 0.5;
    return t * max.value;
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
