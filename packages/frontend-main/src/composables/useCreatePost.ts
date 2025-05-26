import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { userPosts } from './useUserPosts';
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

            const optimisticNewPost = buildNewPost(variables.message, variables.photonValue, hash);

            // Build new feed
            const newFeedPages = context.previousFeed?.pages ? [...context.previousFeed.pages] : [];
            if (newFeedPages.length > 0) {
                newFeedPages[0] = [optimisticNewPost, ...newFeedPages[0]];
            }
            else {
                newFeedPages.push([optimisticNewPost]);
            }
            const newFeedData: InfiniteData<Post[], unknown> = {
                pages: newFeedPages,
                pageParams: context.previousFeed?.pageParams ?? [0],
            };
            // Build new user's posts
            const newUserPostsPages = context.previousUserPosts?.pages ? [...context.previousUserPosts.pages] : [];
            if (newUserPostsPages.length > 0) {
                newUserPostsPages[0] = [optimisticNewPost, ...newUserPostsPages[0]];
            }
            else {
                newUserPostsPages.push([optimisticNewPost]);
            }
            const newUserPostsData: InfiniteData<Post[], unknown> = {
                pages: newUserPostsPages,
                pageParams: context.previousUserPosts?.pageParams ?? [0],
            };

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
