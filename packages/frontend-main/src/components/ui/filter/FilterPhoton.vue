<template>
  <div class="flex flex-col">
    <label class="font-semibold text-sm mb-4">{{ $t('components.Filter.posts') }}</label>
    <Slider :min="0" :max="100" :step="1" v-model="sliderValue" class="cursor-pointer"/>
    <span class="text-sm  mt-2">
      {{ $t('components.Filter.amount') + ': ' + formatCompactNumber(Math.trunc(displayValue)) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Slider } from '@/components/ui/slider';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { formatCompactNumber } from '@/utility/text';

const store = useFiltersStore();

// maxExponent represents the maximum exponent for the slider 7: 10^7 tokens
const maxExponent = 7;

const sliderValue = computed({
    get: () => [inverseExponentialScale(store.minSendAmount)],
    set: val => store.setMinSendAmount(exponentialScale(val[0])),
});

const displayValue = computed(() => store.minSendAmount);

function exponentialScale(value: number) {
    if (!value) return 0;
    const exponent = (value / 100) * maxExponent;
    return Math.pow(10, exponent);
}

function inverseExponentialScale(scaledValue: number) {
    if (!scaledValue || scaledValue <= 0) return 0;
    const exponent = Math.log10(scaledValue);
    return (exponent / maxExponent) * 100;
}

</script>
