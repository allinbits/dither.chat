import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { useWallet } from './useWallet';

interface DislikePostRequestMutation {
    post: Ref<Post>;
    photonValue: number;
}

export function useDislikePost(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ post, photonValue }: DislikePostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.send(
                'Dislike',
                { args: [post.value.hash], amount: BigInt(photonValue).toString() },
            );
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onMutate: async (variables) => {
            const postOpts = post({ hash: ref(variables.post.value.hash) });

            await Promise.all([
                queryClient.cancelQueries(postOpts),
            ]);

            const previousPost = queryClient.getQueryData(
                postOpts.queryKey,
            ) as Post | undefined;

            return {
                previousPost,
            };
        },
        onSuccess: (_, variables, context) => {
            const postOpts = post({ hash: ref(variables.post.value.hash) });
            // Post with updated dislikes count
            const optimisticPost: Post
                = context.previousPost
                    ? { ...context.previousPost, dislikes: (context.previousPost.dislikes || 0) + 1 }
                    : { ...variables.post.value, dislikes: (variables.post.value.dislikes || 0) + 1 };

            queryClient.setQueryData(postOpts.queryKey, optimisticPost);
        },
        onError: (_, variables, context) => {
            const postOpts = post({ hash: ref(variables.post.value.hash) });
            queryClient.setQueryData(postOpts.queryKey, context?.previousPost);
        },
    });

    return {
        dislikePost: mutateAsync,
        txError,
        txSuccess,
    };
}
