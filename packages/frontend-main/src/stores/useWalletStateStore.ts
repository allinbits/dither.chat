import type { Wallets } from '@/composables/useWallet';

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

type WalletProcessState = 'idle' | 'starting' | 'connecting' | 'simulating' | 'broadcasting';

export const useWalletStateStore = defineStore(
    'walletStateStore',
    () => {
        const keplr = computed(() => !!window.keplr);
        const leap = computed(() => !!window.leap);
        const cosmostation = computed(() => !!window.cosmostation);

        const loggedIn = ref(false);
        const address = ref('');
        const used = ref<Wallets | null>(null);
        const processState = ref<WalletProcessState>('idle');
        const isAuthenticated = ref(false);

        const signOut = () => {
            loggedIn.value = false;
            address.value = '';
            used.value = null;
            processState.value = 'idle';
            isAuthenticated.value = false;
        };

        const signIn = (userAddress: string, walletUsed: Wallets) => {
            loggedIn.value = true;
            address.value = userAddress;
            used.value = walletUsed;
        };

        return { keplr, leap, cosmostation, loggedIn, address, used, processState, isAuthenticated, signOut, signIn };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['loggedIn', 'address', 'used'],
        },
    },
);
