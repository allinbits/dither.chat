import { computed, type Ref, ref, watch } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useBalanceFetcher } from './useBalanceFetcher';
import { type PopupState, usePopups } from './usePopups';
import { useWallet } from './useWallet';

import { fractionalDigits } from '@/utility/atomics';

export const useTxDialog = <T>(
    dialogType: keyof PopupState,
    txSuccess: Ref<string | undefined>,
    txError: Ref<string | undefined>,
) => {
    const wallet = useWallet();
    const balanceFetcher = useBalanceFetcher();
    const popups = usePopups();
    const popupState = computed(() => popups.state[dialogType]) as Ref<T>;

    const inputPhotonModel = ref(Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());

    const isBroadcasting = computed(() => wallet.processState.value === 'broadcasting');
    const isShown = computed(() => !!popupState.value && !isBroadcasting.value);

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

    return {
        isShown,
        popupState,
        inputPhotonModel,
        handleClose,
    };
};
