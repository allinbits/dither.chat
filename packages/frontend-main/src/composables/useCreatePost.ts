import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { userPosts } from './useUserPosts';
import { useWallet } from './useWallet';

import { buildNewInfiniteData, buildNewPost } from '@/utility/optimisticBuilders';

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
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            await Promise.all([
                queryClient.cancelQueries(feedOpts),
                queryClient.cancelQueries(userPostsOpts),
            ]);

            const previousFeed = queryClient.getQueryData(
                feedOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousUserPosts = queryClient.getQueryData(
                userPostsOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;

            return { previousFeed, previousUserPosts };
        },
        onSuccess: (hash, variables, context) => {
            if (!hash) throw new Error('Error: No hash in TX');

            const feedOpts = feed();
            const userPostsOpts = userPosts({ userAddress: wallet.address });

            // Created Post
            const optimisticNewPost: Post = buildNewPost({ message: variables.message, quantity: variables.photonValue, hash, author: wallet.address.value, postHash: null });

            const newFeedData = buildNewInfiniteData<Post>({ previousItems: context.previousFeed, newItem: optimisticNewPost });
            const newUserPostsData = buildNewInfiniteData<Post>({ previousItems: context.previousUserPosts, newItem: optimisticNewPost });

            queryClient.setQueryData(feedOpts.queryKey, newFeedData);
            queryClient.setQueryData(userPostsOpts.queryKey, newUserPostsData);
        },
        onError: (_, __, context) => {
            const feedOpts = feed();
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            queryClient.setQueryData(feedOpts.queryKey, context?.previousFeed);
            queryClient.setQueryData(userPostsOpts.queryKey, context?.previousUserPosts);
        },
    });

    return {
        createPost: mutateAsync,
        txError,
        txSuccess,
    };
}
