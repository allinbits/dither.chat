import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

import { addAtomics } from '@/utility/atomics';

interface FlagPostRequestMutation {
    post: Ref<Post>;
    amountAtomics: string;
}

export function useFlagPost(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Flag', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ post, amountAtomics }: FlagPostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Flag',
                { args: [post.value.hash], amount: amountAtomics },
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
        onSuccess: (_, variables) => {
            const postOpts = post({ hash: ref(variables.post.value.hash) });
            // Update post's flags_burnt
            queryClient.setQueryData<Post>(postOpts.queryKey, (current) => {
                const currentFlagsBurnt = current?.flags_burnt ?? variables.post.value.flags_burnt ?? '0';
                const newFlagsBurnt = addAtomics(currentFlagsBurnt, variables.amountAtomics);
                return { ...(current ?? variables.post.value), flags_burnt: newFlagsBurnt };
            });
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        flagPost: mutateAsync,
        txError,
        txSuccess,
    };
}
