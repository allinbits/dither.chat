<script setup lang="ts">
import { nextTick, onMounted } from 'vue';

import { useBalanceFetcher } from './composables/useBalanceFetcher';
import { useWallet } from './composables/useWallet';

const balanceFetcher = useBalanceFetcher();
const wallet = useWallet();

// Fetch balance when wallet state is loaded from storage
onMounted(() => {
    // Wait for next tick to ensure state is loaded from storage
    nextTick(() => {
        if (wallet.address.value) {
            wallet.refreshAddress();
            balanceFetcher.updateAddress(wallet.address.value);
        }
    });
});

</script>

<template>
  <RouterView />
</template>
