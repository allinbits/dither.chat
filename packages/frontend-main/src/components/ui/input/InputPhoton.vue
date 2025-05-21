<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useWallet } from '@/composables/useWallet';

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
      <input
        class="bg-white inline-flex w-full py-2 appearance-none items-center justify-center px-[10px] text-sm leading-none outline-none dark:text-black border"
        type="number"
        v-model="model"
        autocomplete="off"
        :step="1"
        :min="min"
        :max="max"
      />
      <span class="dark:text-white">PHOTON</span>
    </div>
    <span class="text-left text-sm" v-if="balance">{{ formatAmount(photonBalanceSubtracted, 6) }} Available</span>
  </div>
</template>
