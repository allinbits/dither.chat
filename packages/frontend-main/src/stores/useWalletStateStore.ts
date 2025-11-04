import type { WalletType } from '@/composables/useWallet';

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

type WalletProcessState = 'idle' | 'starting' | 'connecting' | 'simulating' | 'broadcasting';

export const useWalletStateStore = defineStore(
  'walletStateStore',
  () => {
    const keplr = computed(() => !!window.keplr);
    const leap = computed(() => !!window.leap);
    const cosmostation = computed(() => !!window.cosmostation);

    const loggedIn = ref(false);
    const address = ref('');
    const used = ref<WalletType | null>(null);
    const processState = ref<WalletProcessState>('idle');
    const isUsingSingleSession = ref(false);

    return { keplr, leap, cosmostation, loggedIn, address, used, processState, isUsingSingleSession };
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['loggedIn', 'address', 'used', 'isUsingSingleSession'],
    },
  },
);
