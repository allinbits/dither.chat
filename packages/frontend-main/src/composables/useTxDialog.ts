import { computed, type Ref, ref, watch } from 'vue';

import { useBalanceFetcher } from './useBalanceFetcher';
import { type PopupState, usePopups } from './usePopups';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

export const useTxDialog = <T>(
    dialogType: keyof PopupState,
    txLabel: string,
    txSuccess: Ref<string | undefined>,
    txError: Ref<string | undefined>,
) => {
    const photonValue = ref(1);

    const popups = usePopups();
    const popupState = computed(() => popups.state[dialogType]) as Ref<T>;

    const isProcessing = computed(() => wallet.processState.value !== 'idle');
    const isBroadcasting = computed(() => wallet.processState.value === 'broadcasting');
    const isShown = computed(() => !!popupState.value && !isBroadcasting.value);
    const isToastShown = computed(() => !!popupState.value);

    useTxNotification(isToastShown, txLabel, txSuccess, txError);

    const wallet = useWallet();
    const balanceFetcher = useBalanceFetcher();

    const handleClose = () => {
        popups.state[dialogType] = null;
        txError.value = undefined;
        txSuccess.value = undefined;
        photonValue.value = 1;
    };

    watch([wallet.loggedIn, wallet.address], async () => {
        if (!wallet.loggedIn.value || !wallet.address.value) {
            return;
        }

        balanceFetcher.updateAddress(wallet.address.value);
    });

    return {
        isProcessing,
        isShown,
        popupState,
        photonValue,
        handleClose,
    };
};
