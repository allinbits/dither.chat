import type { Wallets } from '@/composables/useWallet';

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useWalletStateStore = defineStore(
    'walletStateStore',
    () => {
        const keplr = computed(() => !!window.keplr);
        const leap = computed(() => !!window.leap);
        const cosmostation = computed(() => !!window.cosmostation);

        const loggedIn = ref(false);
        const address = ref('');
        const used = ref<Wallets | null>(null);
        const isBroadcasting = ref(false);

        const signOut = () => {
            loggedIn.value = false;
            address.value = '';
            used.value = null;
            isBroadcasting.value = false;
        };

        const signIn = (userAddress: string, walletUsed: Wallets) => {
            loggedIn.value = true;
            address.value = userAddress;
            used.value = walletUsed;
        };

        return { keplr, leap, cosmostation, loggedIn, address, used, isBroadcasting, signOut, signIn };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['loggedIn', 'address', 'used'],
        },
    },
);
