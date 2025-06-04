import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { userTips } from './useUserTips';
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
        onMutate: async (_) => {
            const userTipsOpts = userTips({ userAddress: wallet.address });
            await queryClient.cancelQueries(userTipsOpts);

            const previousUserTips = queryClient.getQueryData(userTipsOpts.queryKey);

            return {
                previousUserTips,
            };
        },
        onSuccess: () => {
        },
        onError: () => {
        },
        retry: false,
    });

    return {
        tipUser: mutateAsync,
        txError,
        txSuccess,
    };
}
