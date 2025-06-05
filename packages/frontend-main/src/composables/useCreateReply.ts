import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { post } from './usePost';
import { replies } from './useReplies';
import { userReplies } from './useUserReplies';
import { useWallet } from './useWallet';

import { buildNewInfiniteData, buildNewPost } from '@/utility/optimisticBuilders';

interface CreateReplyRequestMutation {
    parentPost: Ref<Post>;
    message: string;
    photonValue: number;
}

export function useCreateReply(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ parentPost, message, photonValue }: CreateReplyRequestMutation) => {
            const result = await wallet.dither.reply(
                parentPost.value.hash,
                message,
                BigInt(photonValue).toString(),
            );
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
        onMutate: async (variables) => {
            const feedOpts = feed();
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash), postHash: ref(variables.parentPost.value.post_hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            await Promise.all([
                queryClient.cancelQueries(feedOpts),
                queryClient.cancelQueries(parentPostOpts),
                queryClient.cancelQueries(repliesOpts),
                queryClient.cancelQueries(userRepliesOpts),
            ]);

            const previousFeed = queryClient.getQueryData(
                feedOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousParentPost = queryClient.getQueryData(
                parentPostOpts.queryKey,
            ) as Post | undefined;
            const previousReplies = queryClient.getQueryData(
                repliesOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousUserReplies = queryClient.getQueryData(
                userRepliesOpts.queryKey,
            ) as InfiniteData<ReplyWithParent[], unknown> | undefined;

            return { previousFeed, previousParentPost, previousReplies, previousUserReplies };
        },
        onSuccess: (createdHash, variables, context) => {
            if (!createdHash) throw new Error('Error: No hash in TX');

            const feedOpts = feed();
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash), postHash: ref(variables.parentPost.value.post_hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            // Whole feed with updated parent post's replies count
            const optimisticNewFeedPages = context.previousFeed?.pages.map(page =>
                page.map(post =>
                    post.hash === variables.parentPost.value.hash
                        ? { ...post, replies: (post.replies || 0) + 1 }
                        : post,
                ),
            );
            const newFeedData: InfiniteData<Post[]> = {
                pageParams: context.previousFeed?.pageParams || [],
                pages: optimisticNewFeedPages || [],
            };

            // Parent Post with updated replies count
            const optimisticParentPost: Post
                = context.previousParentPost
                    ? { ...context.previousParentPost, replies: (context.previousParentPost.replies || 0) + 1 }
                    : { ...variables.parentPost.value, replies: (variables.parentPost.value.replies || 0) + 1 };
            // Created Post with parent hash as post_hash
            const optimisticNewReply: Post = buildNewPost({ message: variables.message, quantity: variables.photonValue, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value });
            // Created Post in ReplyWithParent
            const optimisticNewUserReply: ReplyWithParent = {
                reply: buildNewPost(
                    { message: variables.message, quantity: variables.photonValue, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value },
                ),
                parent: optimisticParentPost,
            };

            const newRepliesData = buildNewInfiniteData<Post>({ previousItems: context.previousReplies, newItem: optimisticNewReply });
            const newUserRepliesData = buildNewInfiniteData<ReplyWithParent>({ previousItems: context.previousUserReplies, newItem: optimisticNewUserReply });

            queryClient.setQueryData(feedOpts.queryKey, newFeedData);
            queryClient.setQueryData(parentPostOpts.queryKey, optimisticParentPost);
            queryClient.setQueryData(repliesOpts.queryKey, newRepliesData);
            queryClient.setQueryData(userRepliesOpts.queryKey, newUserRepliesData);
        },
        onError: (_, variables, context) => {
            const feedOpts = feed();
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash), postHash: ref(variables.parentPost.value.post_hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            queryClient.setQueryData(feedOpts.queryKey, context?.previousFeed);
            queryClient.setQueryData(parentPostOpts.queryKey, context?.previousParentPost);
            queryClient.setQueryData(repliesOpts.queryKey, context?.previousReplies);
            queryClient.setQueryData(userRepliesOpts.queryKey, context?.previousUserReplies);
        },
    });

    return {
        createReply: mutateAsync,
        txError,
        txSuccess,
    };
}
