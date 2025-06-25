<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useChain } from '@/composables/useChain';
import { useWallet } from '@/composables/useWallet';

import Input from './Input.vue';

const model = defineModel<number>();
const emits = defineEmits<{ onValidityChange: [isValid: boolean] }>();

const { getCurrencyCoinDecimals } = useChain();
const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const decimals = getCurrencyCoinDecimals('c') ?? 6;
const minimalAmount = 10 ** -decimals;

const min = minimalAmount;
const step = minimalAmount;
const max = 5_000_000;

const rawBalance = computed(() => {
    if (!wallet.loggedIn.value) return '0';
    const balances = balanceFetcher.balances.value[wallet.address.value];
    return balances?.find(x => x.denom === 'uphoton')?.amount ?? '0';
});
const balance = computed(() => Decimal.fromAtomics(rawBalance.value, decimals));
const balanceDiff = computed(() => balance.value.minus(inputDecimal.value).toString());

const inputDecimal = computed(() =>
    Decimal.fromUserInput((model.value ?? 0).toString(), decimals),
);

watchEffect(() => {
    console.log('balancebalancebalance', balance.value);
    console.log('balanceDiffbalanceDiffbalanceDiff', balanceDiff.value);
    const value = model.value;
    if (value === undefined || value < 0) return emits('onValidityChange', false);

    try {
        const enoughBalance = balance.value.isGreaterThanOrEqual(inputDecimal.value);
        emits('onValidityChange', enoughBalance);
    }
    catch {
        emits('onValidityChange', false);
    }
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <div class="flex flex-row gap-4 items-center w-full">
      <Input
        v-model="model"
        :placeholder="$t('components.InputPhoton.placeholder')"
        type="number"
        :min="min"
        :step="step"
        :max="max"
        autocomplete="off"
      />
      <span class="dark:text-white">PHOTON</span>
    </div>
    <span class="text-left text-sm">
      {{
        Number(balanceDiff) >= 0
          ? balanceDiff + ' PHOTON ' + $t('components.InputPhoton.available')
          : $t('components.InputPhoton.notEnough')
      }}
    </span>
  </div>
</template>
