<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useChain } from '@/composables/useChain';
import { useWallet } from '@/composables/useWallet';

import Input from './Input.vue';

import { formatAmount } from '@/utility/text';

const model = defineModel<number>();
const props = defineProps<{ min?: number; max?: number; step?: number; balance?: boolean }>();
const emits = defineEmits<{ onValidityChange: [isValid: boolean] }>();

const { getMinimalCurrencyAmount, getCurrencyCoinDecimals } = useChain();
const minimalPhotonValue = getMinimalCurrencyAmount('PHOTON');
const photonDecimals = getCurrencyCoinDecimals('PHOTON') ?? 6;

const min = computed(() => props.min ?? minimalPhotonValue);
const max = computed(() => props.max ?? 5_000_000);
const step = computed(() => props.step ?? minimalPhotonValue);

const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const photonBalance = computed(() => {
    if (!wallet.loggedIn.value) return '0';
    const balances = balanceFetcher.balances.value[wallet.address.value];
    if (!balances) return '0';
    const balance = balances.find(x => x.denom === 'uphoton');
    return balance?.amount ?? '0';
});

const photonBalanceSubtracted = computed(() => {
    const balance = BigInt(photonBalance.value);
    const modelAmount = BigInt(Math.floor((model?.value ?? 0) * 10 ** photonDecimals));
    return String(balance - modelAmount);
});

function verifyValidity(value: number | undefined) {
    if (value === undefined || value < 0) return emits('onValidityChange', false);

    const valueInMicro = BigInt(Math.floor(value * 10 ** photonDecimals));
    const available = BigInt(photonBalance.value);

    if (props.balance && valueInMicro > available) return emits('onValidityChange', false);

    emits('onValidityChange', true);
}

watch([model, photonBalance], () => {
    verifyValidity(model.value);
});
onMounted(() => {
    verifyValidity(model.value);
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <div class="flex flex-row gap-4 items-center w-full">
      <Input v-model="model" :placeholder="$t('components.InputPhoton.placeholder')" type="number" :min="min"
             :step="step" :max="max" autocomplete="off" />

      <span class="dark:text-white">PHOTON</span>
    </div>
    <span class="text-left text-sm">{{ Number(photonBalanceSubtracted) >= 0 ?
      formatAmount(photonBalanceSubtracted, 6) + ' PHOTON ' + $t('components.InputPhoton.available') :
      $t('components.InputPhoton.notEnough')}}
    </span>
  </div>
</template>
