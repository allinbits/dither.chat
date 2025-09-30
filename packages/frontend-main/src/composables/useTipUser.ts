import { type Ref, ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';

import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

interface TipUserRequestMutation {
    userAddress: Ref<string>;
    amountAtomics: string;
}

export function useTipUser() {
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Tip', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ userAddress, amountAtomics }: TipUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.tipUser(userAddress.value, amountAtomics);
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
            return txSuccess.value;
        },
        onSettled: () => {
            isToastShown.value = false;
        },
        retry: false,
    });

    return {
        tipUser: mutateAsync,
        txError,
        txSuccess,
    };
}
