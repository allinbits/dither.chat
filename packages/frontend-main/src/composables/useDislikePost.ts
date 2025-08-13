import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

import { addAtomics } from '@/utility/atomics';

interface DislikePostRequestMutation {
    post: Ref<Post>;
    amountAtomics: string;
}

export function useDislikePost() {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Dislike', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ post, amountAtomics }: DislikePostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Dislike',
                { args: [post.value.hash], amount: amountAtomics },
            );
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onSuccess: (_, variables) => {
            const postOpts = post({ hash: ref(variables.post.value.hash) });
            // Update post's dislikes_burnt
            queryClient.setQueryData<Post>(postOpts.queryKey, (current) => {
                const currentDislikesBurnt = current?.dislikes_burnt ?? variables.post.value.dislikes_burnt ?? '0';
                const newDislikeBurnt = addAtomics(currentDislikesBurnt, variables.amountAtomics);
                return { ...(current ?? variables.post.value), dislikes_burnt: newDislikeBurnt };
            });
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        dislikePost: mutateAsync,
        txError,
        txSuccess,
    };
}
