<script setup lang="ts">
import type { Ref } from 'vue';

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { useWallet } from '@/composables/useWallet';

import chainConfig from '@/chain-config.json';
import { formatAmount } from '@/utility';

const Wallet = useWallet();

const balancesFetcher = (address: Ref<string>) =>
    fetch(`${chainConfig.rest}cosmos/bank/v1beta1/balances/${address.value}?pagination.limit=1000`).then(response =>
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
            (x: { denom: string }) => x.denom == chainConfig.stakeCurrency.coinMinimalDenom,
        )[0];
    }
    else {
        return { amount: '0', denom: chainConfig.stakeCurrency.coinMinimalDenom };
    }
});
</script>
<template>
  <span>{{ formatAmount(balance.amount, chainConfig.stakeCurrency.coinDecimals) }}</span>
</template>
