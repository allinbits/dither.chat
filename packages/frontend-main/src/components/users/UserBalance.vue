<script setup lang="ts">
import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { useChain } from '@/composables/useChain';
import { useWallet } from '@/composables/useWallet';

const Wallet = useWallet();

const { chainConfig, getAmountFromAtomic } = useChain();

const balancesFetcher = (address: Ref<string>) =>
    fetch(`${chainConfig.value.rest}cosmos/bank/v1beta1/balances/${address.value}?pagination.limit=1000`).then(response =>
        response.json(),
    );
const { data: balances } = useQuery({
    queryKey: ['balances'],
    queryFn: () => balancesFetcher(Wallet.address),
    enabled: Wallet.loggedIn,
});
const balance = computed(() => {
    if (balances && balances.value) {
        return balances.value.balances.filter(
            (x: { denom: string }) => x.denom == chainConfig.value.stakeCurrency.coinMinimalDenom,
        )[0];
    }
    else {
        return { amount: '0', denom: chainConfig.value.stakeCurrency.coinMinimalDenom };
    }
});
</script>
<template>
  <span>{{ getAmountFromAtomic( balance.amount) }}</span>
</template>
