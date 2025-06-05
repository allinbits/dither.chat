import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { post } from './usePost';
import { replies } from './useReplies';
import { userPosts } from './useUserPosts';
import { userReplies } from './useUserReplies';
import { useWallet } from './useWallet';

import { infiniteDataWithNewItem, newPost } from '@/utility/optimisticBuilders';

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
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash), postHash: ref(variables.parentPost.value.post_hash) });
            const feedOpts = feed();
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            await Promise.all([
                queryClient.cancelQueries(parentPostOpts),
                queryClient.cancelQueries(feedOpts),
                queryClient.cancelQueries(repliesOpts),
                queryClient.cancelQueries(userPostsOpts),
                queryClient.cancelQueries(userRepliesOpts),
            ]);

            const previousParentPost = queryClient.getQueryData(
                parentPostOpts.queryKey,
            ) as Post | undefined;
            const previousFeed = queryClient.getQueryData(
                feedOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousReplies = queryClient.getQueryData(
                repliesOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousUserPosts = queryClient.getQueryData(
                userPostsOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousUserReplies = queryClient.getQueryData(
                userRepliesOpts.queryKey,
            ) as InfiniteData<ReplyWithParent[], unknown> | undefined;

            return { previousFeed, previousParentPost, previousReplies, previousUserPosts, previousUserReplies };
        },
        onSuccess: (createdHash, variables, context) => {
            if (!createdHash) throw new Error('Error: No hash in TX');

            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash), postHash: ref(variables.parentPost.value.post_hash) });
            const feedOpts = feed();
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            // Created Post with parent hash as post_hash
            const optimisticNewReply: Post = newPost({ message: variables.message, quantity: variables.photonValue, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value });

            // Parent Post with updated replies count
            const optimisticParentPost: Post
                = context.previousParentPost
                    ? { ...context.previousParentPost, replies: (context.previousParentPost.replies || 0) + 1 }
                    : { ...variables.parentPost.value, replies: (variables.parentPost.value.replies || 0) + 1 };

            // Created Post in ReplyWithParent
            const optimisticNewUserReply: ReplyWithParent = {
                reply: newPost(
                    { message: variables.message, quantity: variables.photonValue, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value },
                ),
                parent: optimisticParentPost,
            };

            // Whole user posts with updated parent post's replies count
            const optimisticUserPostsPages = context.previousUserPosts?.pages.map(page =>
                page.map(post =>
                    post.hash === variables.parentPost.value.hash
                        ? { ...post, replies: (post.replies || 0) + 1 }
                        : post,
                ),
            );
            let optimisticUserPostsData: InfiniteData<Post[]> = {
                pageParams: context.previousUserPosts?.pageParams || [],
                pages: optimisticUserPostsPages || [],
            };

            // Whole user replies with updated parent post's replies count (The case where the parent post is a reply itselves)
            const optimisticUserRepliesPages = context.previousUserReplies?.pages.map(page =>
                page.map(replyWithParent =>
                    replyWithParent.reply.hash === variables.parentPost.value.hash
                        ? { reply: { ...replyWithParent.reply, replies: (replyWithParent.reply.replies || 0) + 1 }, parent: replyWithParent.parent }
                        : replyWithParent,
                ),
            );
            let optimisticUserRepliesData: InfiniteData<ReplyWithParent[]> = {
                pageParams: context.previousUserReplies?.pageParams || [],
                pages: optimisticUserRepliesPages || [],
            };

            // Whole feed with updated parent post's replies count
            const optimisticFeedPages = context.previousFeed?.pages.map(page =>
                page.map(post =>
                    post.hash === variables.parentPost.value.hash
                        ? { ...post, replies: (post.replies || 0) + 1 }
                        : post,
                ),
            );
            const optimisticFeedData: InfiniteData<Post[]> = {
                pageParams: context.previousFeed?.pageParams || [],
                pages: optimisticFeedPages || [],
            };

            // Post's replies updated with the new reply
            const optimisticRepliesData = infiniteDataWithNewItem<Post>({ previousItems: context.previousReplies, newItem: optimisticNewReply });
            // User's posgts updated with the new reply and the updated parent post's replies count
            optimisticUserPostsData = infiniteDataWithNewItem<Post>({ previousItems: optimisticUserPostsData, newItem: optimisticNewReply });
            // User's replies updated with the new reply and the updated parent post's replies count
            optimisticUserRepliesData = infiniteDataWithNewItem<ReplyWithParent>({ previousItems: optimisticUserRepliesData, newItem: optimisticNewUserReply });

            queryClient.setQueryData(feedOpts.queryKey, optimisticFeedData);
            queryClient.setQueryData(parentPostOpts.queryKey, optimisticParentPost);
            queryClient.setQueryData(repliesOpts.queryKey, optimisticRepliesData);
            queryClient.setQueryData(userPostsOpts.queryKey, optimisticUserPostsData);
            queryClient.setQueryData(userRepliesOpts.queryKey, optimisticUserRepliesData);
        },
        onError: (_, variables, context) => {
            const feedOpts = feed();
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash), postHash: ref(variables.parentPost.value.post_hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            queryClient.setQueryData(feedOpts.queryKey, context?.previousFeed);
            queryClient.setQueryData(parentPostOpts.queryKey, context?.previousParentPost);
            queryClient.setQueryData(repliesOpts.queryKey, context?.previousReplies);
            queryClient.setQueryData(userPostsOpts.queryKey, context?.previousUserPosts);
            queryClient.setQueryData(userRepliesOpts.queryKey, context?.previousUserReplies);
        },
    });

    return {
        createReply: mutateAsync,
        txError,
        txSuccess,
    };
}
