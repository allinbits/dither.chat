import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';

import { useWallet } from './useWallet';

interface FlagPostRequestMutation {
    postHash: string;
    atomicPhotonValue: number;
}

export function useFlagPost(
) {
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ postHash, atomicPhotonValue }: FlagPostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.send(
                'Flag',
                { args: [postHash], amount: BigInt(atomicPhotonValue).toString() },
            );

            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
            if (txSuccess.value) {
                return txSuccess.value;
            }
        },
        // TODO: onMutate, onSuccess, onError
    });

    return {
        flagPost: mutateAsync,
        txError,
        txSuccess,
    };
}
