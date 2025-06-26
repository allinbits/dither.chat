<script setup lang="ts">
import { computed } from 'vue';

import { useChain } from '@/composables/useChain';

import { Slider } from '@/components/ui/slider';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { atomicsStringToNumber } from '@/utility/atomics';

const store = useFiltersStore();
const { getMinimalAmount, getAmountFromAtomics } = useChain();

const minimalAmount = atomicsStringToNumber(getMinimalAmount('uphoton'));
const min = computed(() => minimalAmount);
const step = computed(() => minimalAmount);
const maxExponent = 2; // maxExponent represents the maximum exponent for the slider: 10^maxExponent tokens
const max = computed(() => Math.pow(10, maxExponent));

const displayValue = computed(() => getAmountFromAtomics(store.filterAmount.toString(), 'uphoton'));
const sliderValue = computed({
    get: () => [inverseExponentialScale(store.filterAmount)],
    set: val => store.setFilterAmount(exponentialScale(val[0])),
});

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
