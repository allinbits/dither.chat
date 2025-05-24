import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { useWallet } from './useWallet';

interface CreatePostRequestMutation {
    message: string;
    photonValue: number;
}

export function useCreatePost(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const buildNewPost = (message: string, photonValue: number, hash: string): Post => ({
        hash: hash.toLowerCase(),
        post_hash: null,
        author: wallet.address.value,
        timestamp: new Date(),
        message,
        quantity: photonValue,
        replies: 0,
        likes: 0,
        dislikes: 0,
        flags: null,
        likes_burnt: null,
        dislikes_burnt: null,
        flags_burnt: null,
        removed_hash: null,
        removed_at: null,
        removed_by: null,
    });

    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ message, photonValue }: CreatePostRequestMutation) => {
            const result = await wallet.dither.post(message, BigInt(photonValue).toString());
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
            if (txSuccess.value) {
                message = '';
                return txSuccess.value;
            }
        },
        onMutate: async () => {
            const feedOpts = feed();
            await queryClient.cancelQueries(feedOpts);

            const previousFeed = queryClient.getQueryData(
                feedOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;

            return { previousFeed };
        },
        onSuccess: (hash, variables, context) => {
            if (!hash) throw new Error('Error: No hash in TX');

            const feedOpts = feed();
            const optimisticNewPost = buildNewPost(variables.message, variables.photonValue, hash);
            const newPages = context.previousFeed?.pages ? [...context.previousFeed.pages] : [];
            if (newPages.length > 0) {
                newPages[0] = [optimisticNewPost, ...newPages[0]];
            }
            else {
                newPages.push([optimisticNewPost]);
            }
            const newFeedData: InfiniteData<Post[], unknown> = {
                pages: newPages,
                pageParams: context.previousFeed?.pageParams ?? [0],
            };

            queryClient.setQueryData(feedOpts.queryKey, newFeedData);
        },
        onError: (_, __, context) => {
            const feedOpts = feed();
            queryClient.setQueryData(feedOpts.queryKey, context?.previousFeed);
        },
    });

    return {
        createPost: mutateAsync,
        txError,
        txSuccess,
    };
}
