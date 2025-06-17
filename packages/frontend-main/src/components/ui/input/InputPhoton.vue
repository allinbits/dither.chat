<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useWallet } from '@/composables/useWallet';

import Input from './Input.vue';

import { formatAmount } from '@/utility/text';

const model = defineModel<number>();
const emits = defineEmits<{ onValidityChange: [isValid: boolean] }>();
const props = withDefaults(defineProps<{ min?: number; max?: number; balance?: boolean }>(), { min: 1, max: 5_000_000, balance: true });

const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const photonBalance = computed(() => {
    if (!wallet.loggedIn.value) {
        return '0';
    }

    const balances = balanceFetcher.balances.value[wallet.address.value];
    if (!balances) {
        return '0';
    }

    const balance = balances.find(x => x.denom === 'uphoton');
    return balance?.amount ?? '0';
});

const photonBalanceSubtracted = computed(() => {
    return String(BigInt(photonBalance.value) - BigInt(model?.value ?? 0));
});

function verifyValidity(value: number | undefined) {
    if (!value || value < 0) {
        emits('onValidityChange', false);
        return;
    }

    if (String(value).includes('.')) {
        emits('onValidityChange', false);
        return;
    }

    if (props.balance && BigInt(photonBalance.value) < BigInt(props.balance)) {
        emits('onValidityChange', false);
        return;
    }

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
      <Input v-model="model" :placeholder="$t('placeholders.search')" type="number"         :min="min"
             :max="max" autocomplete="off"/>
      <span class="dark:text-white">PHOTON</span>
    </div>
    <span class="text-left text-sm" v-if="Number(photonBalanceSubtracted) >= 0">{{ formatAmount(photonBalanceSubtracted, 6) }}</span>
    <span class="text-left text-sm" v-else>{{ $t('components.InputPhoton.notEnough') }}</span>
  </div>
</template>
