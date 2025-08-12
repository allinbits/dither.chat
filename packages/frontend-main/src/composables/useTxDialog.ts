import type { Ref } from 'vue';

import { Decimal } from '@cosmjs/math';
import { computed, ref, watch } from 'vue';

import { useBalanceFetcher } from './useBalanceFetcher';
import { useFractionalDigits } from './useFractionalDigits';
import type { PopupState } from './usePopups';
import { usePopups } from './usePopups';
import { useWallet } from './useWallet';

export function useTxDialog<T>(dialogType: keyof PopupState, txSuccess: Ref<string | undefined>, txError: Ref<string | undefined>) {
  const fractionalDigits = useFractionalDigits();
  const inputPhotonModel = ref(Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
  const wallet = useWallet();
  const balanceFetcher = useBalanceFetcher();
  const popups = usePopups();
  const popupState = computed(() => popups.state[dialogType]) as Ref<T>;
  const isShown = computed(() => !!popupState.value);

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
}
