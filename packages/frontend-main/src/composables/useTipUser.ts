import { type Ref, ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';

import { useChain } from './useChain';
import { useWallet } from './useWallet';

interface TipUserRequestMutation {
    userAddress: Ref<string>;
    photonValue: number;
}

export function useTipUser() {
    const { getAtomicsAmount } = useChain();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const { mutateAsync } = useMutation({
        mutationFn: async ({ userAddress, photonValue }: TipUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.tipUser(userAddress.value, getAtomicsAmount(photonValue));
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
            return txSuccess.value;
        },
        // TODO: To be implemented when integrating with useUserTips
        onMutate: async (_) => {},
        onSuccess: () => {},
        onError: () => {},
        retry: false,
    });

    return {
        tipUser: mutateAsync,
        txError,
        txSuccess,
    };
}
