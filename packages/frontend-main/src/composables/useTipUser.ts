import { type Ref, ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';

import { useWallet } from './useWallet';

interface TipUserRequestMutation {
    userAddress: Ref<string>;
    atomicPhotonValue: number;
}

export function useTipUser() {
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const { mutateAsync } = useMutation({
        mutationFn: async ({ userAddress, atomicPhotonValue }: TipUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.tipUser(userAddress.value, BigInt(atomicPhotonValue).toString());
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
