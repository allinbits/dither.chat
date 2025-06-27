<script setup lang="ts">
import { computed } from 'vue';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useWallet } from '@/composables/useWallet';

import { fractionalDigits } from '@/utility/atomics';
import { formatCompactAtomics } from '@/utility/text';

const wallet = useWallet();

const balanceFetcher = useBalanceFetcher();

const balanceAtomics = computed(() => {
    if (!wallet.loggedIn.value) return '0';
    const balances = balanceFetcher.balances.value[wallet.address.value];
    return balances?.find(x => x.denom === 'uphoton')?.amount ?? '0';
});

</script>
<template>
  <span>{{ formatCompactAtomics(balanceAtomics, fractionalDigits) }}</span>
</template>
