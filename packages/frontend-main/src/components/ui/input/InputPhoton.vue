<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useWallet } from '@/composables/useWallet';

import Input from './Input.vue';

import { fractionalDigits } from '@/utility/atomics';
import { formatCompactNumber } from '@/utility/text';

const emit = defineEmits(['update:modelValue', 'onValidityChange']);

const min = computed(() => Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const step = computed(() => Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const max = computed(() => Decimal.fromUserInput('5000000', fractionalDigits).toFloatApproximation());
const model = defineModel<number>({ default: Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation() });

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
const balanceDiffDisplay = computed(() => formatCompactNumber(balanceDecimal.value.minus(Decimal.fromUserInput(model.value.toString(), fractionalDigits)).toFloatApproximation()));

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
        v-model="model"
        type="number"
        :min="min"
        :step="step"
        :max="max"
        autocomplete="off"
        :placeholder="$t('components.InputPhoton.placeholder')"
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
