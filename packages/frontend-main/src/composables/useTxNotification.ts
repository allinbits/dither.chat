import { type Ref, watch } from 'vue';

import { useToast } from './useToast';
import { useWallet } from './useWallet';

const explorerURL
    = import.meta.env.VITE_EXPLORER_URL ?? 'https://testnet.explorer.allinbits.services/atomone-devnet-1/tx';

export const useTxNotification = (txSuccess: Ref<string | undefined>, txError: Ref<string | undefined>) => {
    const { showToast } = useToast();
    const wallet = useWallet();

    watch(wallet.processState, (newState) => {
        if (newState === 'broadcasting') {
            showToast('info', 'Processing', 'Broadcasting transaction...');
        }
    });

    watch(txSuccess, (newValue) => {
        if (newValue) {
            showToast('success', 'Success', `Transaction hash: ${newValue}`, 10_000, {
                label: 'View on explorer',
                onClick: () => {
                    window.open(`${explorerURL}/${newValue}`, '_blank');
                },
            });
        }
    });
    watch(txError, (newValue) => {
        if (newValue) {
            showToast('error', 'Error', newValue, 5_000);
        }
    });
};
