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
        const isUsingSessionSigning = ref(false);

        return { keplr, leap, cosmostation, loggedIn, isUsingSessionSigning, address, used, processState };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['loggedIn', 'address', 'used'],
        },
    },
);
