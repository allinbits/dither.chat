import { computed, type Ref, ref, watch } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useBalanceFetcher } from './useBalanceFetcher';
import { type PopupState, usePopups } from './usePopups';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

import { fractionalDigits } from '@/utility/atomics';

export const useTxDialog = <T>(
    dialogType: keyof PopupState,
    txLabel: string,
    txSuccess: Ref<string | undefined>,
    txError: Ref<string | undefined>,
) => {
    const inputPhotonModel = ref(Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());

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
        inputPhotonModel.value = Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation();
    };

    watch([wallet.loggedIn, wallet.address], async () => {
        if (!wallet.loggedIn.value || !wallet.address.value) {
            return;
        }

        balanceFetcher.updateAddress(wallet.address.value);
    });

    watch([inputPhotonModel], () => {
        console.log(inputPhotonModel.value);
    });

    return {
        isProcessing,
        isShown,
        popupState,
        inputPhotonModel,
        handleClose,
    };
};
