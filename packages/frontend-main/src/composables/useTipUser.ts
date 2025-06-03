import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useWallet } from './useWallet';

interface TipUserRequestMutation {
    userAddress: Ref<string>;
    photonValue: number;
}

export function useTipUser() {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const { mutateAsync } = useMutation({
        mutationFn: async ({ userAddress, photonValue }: TipUserRequestMutation) => {
            const result = await wallet.dither.tipUser(userAddress.value, BigInt(photonValue).toString());
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onMutate: async (variables) => {},
        onSuccess: (_, variables, context) => {},
        onError: (_, variables, context) => {},
        retry: false,
    });

    return {
        followUser: mutateAsync,
        txError,
        txSuccess,
    };
}
