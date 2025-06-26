<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useChain } from '@/composables/useChain';
import { useWallet } from '@/composables/useWallet';

import Input from './Input.vue';

defineProps<{ modelValue: string | number | undefined }>();
const emits = defineEmits<{ onValidityChange: [isValid: boolean] }>();
const model = defineModel<string | number | undefined>();

const { getCoinDecimals, getMinimalAmount } = useChain();
const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const minimalAmount = getMinimalAmount('uphoton');
const decimals = getCoinDecimals('uphoton');
const min = computed(() => minimalAmount);
const max = computed(() => 5_000_000);
const step = computed(() => minimalAmount);

const balanceAtomics = computed(() => {
    if (!wallet.loggedIn.value) return '0';
    const balances = balanceFetcher.balances.value[wallet.address.value];
    return balances?.find(x => x.denom === 'uphoton')?.amount ?? '0';
});
const balance = computed(() => !decimals ? Decimal.zero(0) : Decimal.fromAtomics(balanceAtomics.value, decimals));
const inputValue = computed(() =>
    !decimals ? Decimal.zero(0) : Decimal.fromUserInput(model.value?.toString() ?? min.value, decimals),
);
const balanceDiff = computed(() => balance.value.isGreaterThan(inputValue.value) ? balance.value.minus(inputValue.value) : 0);

watchEffect(() => {
    const value = model.value;
    if (!value) return emits('onValidityChange', false);
    try {
        const enoughBalance = balance.value.isGreaterThanOrEqual(inputValue.value);
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
      <Input v-model="model" :placeholder="$t('components.InputPhoton.placeholder')" type="number" :min="min"
             :step="step" :max="max" autocomplete="off" />
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
