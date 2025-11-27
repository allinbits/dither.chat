import { useMutation } from '@tanstack/vue-query';
import { ref } from 'vue';

import { showInfoToast } from '@/utility/toast';

import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

interface RegisterHandleRequestMutation {
  handle: string;
  amountAtomics: string;
}

export function useRegisterHandle() {
  const wallet = useWallet();
  const txError = ref<string>();
  const txSuccess = ref<string>();
  const isToastShown = ref(false);
  useTxNotification('Register Handle', txSuccess, txError);

  const {
    mutateAsync,
  } = useMutation({
    mutationFn: async ({ handle, amountAtomics }: RegisterHandleRequestMutation) => {
      txError.value = undefined;
      txSuccess.value = undefined;
      isToastShown.value = true;

      const result = await wallet.dither.send('RegisterHandle', {
        args: [handle],
        amount: amountAtomics,
      });

      if (!result.broadcast) {
        txError.value = result.msg;
        throw new Error(result.msg);
      }

      txSuccess.value = result.tx?.transactionHash;
    },
    onSuccess: () => {
      showInfoToast('Account Handle Registered', 'Your new handle will take effect soon', 9000);
    },
    onSettled: () => {
      isToastShown.value = false;
    },
  });

  return {
    registerHandle: mutateAsync,
    txError,
    txSuccess,
  };
}
