<script setup lang="ts">
import { nextTick, onMounted } from 'vue';

import DislikePostDialog from './components/popups/DislikePostDialog.vue';
import LikePostDialog from './components/popups/LikePostDialog.vue';
import NewPostDialog from './components/popups/NewPostDialog.vue';
import ReplyDialog from './components/popups/ReplyDialog.vue';
import WalletConnectDialog from './components/wallet/WalletConnectDialog.vue';
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
  <WalletConnectDialog/>
  <LikePostDialog />
  <DislikePostDialog />
  <NewPostDialog />
  <ReplyDialog/>
</template>
