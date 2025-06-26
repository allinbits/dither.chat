import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useChain } from './useChain';
import { post } from './usePost';
import { useWallet } from './useWallet';

import { addAtomics } from '@/utility/atomics';

interface FlagPostRequestMutation {
    post: Ref<Post>;
    photonValue: string;
}

export function useFlagPost(
) {
    const queryClient = useQueryClient();
    const { getAtomicsAmount } = useChain();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ post, photonValue }: FlagPostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.send(
                'Flag',
                { args: [post.value.hash], amount: getAtomicsAmount(photonValue, 'uphoton') },
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
            // Post with updated flags_burnt
            const optimisticPost: Post
                = context.previousPost
                    ? { ...context.previousPost, flags_burnt: addAtomics((context.previousPost.flags_burnt ?? 0).toString(), variables.photonValue) }
                    : { ...variables.post.value, flags_burnt: addAtomics((variables.post.value.flags_burnt ?? 0).toString(), variables.photonValue) };

            queryClient.setQueryData(postOpts.queryKey, optimisticPost);
        },
        onError: (_, variables, context) => {
            const postOpts = post({ hash: ref(variables.post.value.hash) });
            queryClient.setQueryData(postOpts.queryKey, context?.previousPost);
        } });

    return {
        flagPost: mutateAsync,
        txError,
        txSuccess,
    };
}
