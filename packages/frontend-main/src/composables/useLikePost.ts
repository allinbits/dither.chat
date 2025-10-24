import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

import { addAtomics } from '@/utility/atomics';

interface LikePostRequestMutation {
    post: Ref<Post>;
    amountAtomics: string;
}

export function useLikePost() {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Like', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ post, amountAtomics }: LikePostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Like',
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
            // Update post's likes_burnt
            queryClient.setQueryData<Post>(postOpts.queryKey, (current) => {
                const currentLikesBurnt = current?.likes_burnt ?? variables.post.value.likes_burnt ?? '0';
                const newLikesBurnt = addAtomics(currentLikesBurnt, variables.amountAtomics);
                return { ...(current ?? variables.post.value), likes_burnt: newLikesBurnt };
            });
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        likePost: mutateAsync,
        txError,
        txSuccess,
    };
}
