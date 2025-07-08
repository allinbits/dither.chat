<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useWallet } from '@/composables/useWallet';

import Input from './Input.vue';

import { fractionalDigits } from '@/utility/atomics';

const emit = defineEmits(['update:modelValue', 'onValidityChange']);

const min = computed(() => Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const step = computed(() => Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const model = defineModel<number | string>({ default: Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation() });

const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const balanceAtomics = computed(() => {
    if (!wallet.loggedIn.value) return '0';
    const balances = balanceFetcher.balances.value[wallet.address.value];
    return balances?.find(x => x.denom === 'uphoton')?.amount ?? '0';
});
const balanceDecimal = computed(() => Decimal.fromAtomics(balanceAtomics.value, fractionalDigits));
const hasEnoughBalance = computed(() =>
    balanceDecimal.value.isGreaterThanOrEqual(
        Decimal.fromUserInput(model.value.toString(), fractionalDigits),
    ),
);
const balanceDiffDisplay = computed(() =>
    balanceDecimal.value.minus(Decimal.fromUserInput(model.value.toString(), fractionalDigits)).toString(),
);

// Truncate the input value to respect fractionalDigits
function sanitizeDecimals(value: number | string) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return NaN;
    const factor = Math.pow(10, fractionalDigits);
    return Math.floor(num * factor) / factor;
}
function onInput(val: string | number) {
    const sanitized = sanitizeDecimals(val);
    if (isNaN(sanitized)) return;
    model.value = sanitized;
}
// Prevent non-numeric
function onKeydown(e: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
}

watchEffect(() => {
    const value = model.value;
    if (!value) return emit('onValidityChange', false);
    try {
        emit('onValidityChange', hasEnoughBalance.value);
    }
    catch {
        emit('onValidityChange', false);
    }
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <div class="flex flex-row gap-4 items-center w-full">
      <Input
        type="number"
        autocomplete="off"
        :placeholder="$t('components.InputPhoton.placeholder')"
        :modelValue="model"
        :min="min"
        :step="step"
        @update:modelValue="onInput"
        @keydown="onKeydown"
      />
      <span class="dark:text-white">PHOTON</span>
    </div>
    <span class="text-left text-sm">
      {{
        hasEnoughBalance
          ? balanceDiffDisplay + ' PHOTON ' + $t('components.InputPhoton.available')
          : $t('components.InputPhoton.notEnough')
      }}
    </span>
  </div>
</template>
