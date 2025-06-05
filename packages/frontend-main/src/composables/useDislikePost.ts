import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { followingPosts } from './useFollowingPosts';
import { post } from './usePost';
import { replies } from './useReplies';
import { userPosts } from './useUserPosts';
import { userReplies } from './useUserReplies';
import { useWallet } from './useWallet';

import { infiniteDataWithUpdatedPost } from '@/utility/optimisticBuilders';

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
            const result = await wallet.dither.dislike(
                post.value.hash,
                BigInt(photonValue).toString(),
            );
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onMutate: async (variables) => {
            const feedOpts = feed();
            const postOpts = post({ hash: ref(variables.post.value.hash), postHash: ref(variables.post.value.post_hash) });
            const repliesOpts = variables.post.value.post_hash ? replies({ hash: ref(variables.post.value.post_hash) }) : undefined;
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });

            await Promise.all([
                queryClient.cancelQueries(postOpts),
                queryClient.cancelQueries(feedOpts),
                queryClient.cancelQueries(repliesOpts),
                queryClient.cancelQueries(userPostsOpts),
                queryClient.cancelQueries(userRepliesOpts),
                queryClient.cancelQueries(followingPostsOpts),
            ]);

            const previousPost = queryClient.getQueryData(
                postOpts.queryKey,
            ) as Post | undefined;
            const previousFeed = queryClient.getQueryData(
                feedOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousReplies = repliesOpts
                ? queryClient.getQueryData(
                        repliesOpts.queryKey,
                    )
                : undefined as InfiniteData<Post[], unknown> | undefined;
            const previousUserPosts = queryClient.getQueryData(
                userPostsOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousUserReplies = queryClient.getQueryData(
                userRepliesOpts.queryKey,
            ) as InfiniteData<ReplyWithParent[], unknown> | undefined;
            const previousFollowingPosts = queryClient.getQueryData(
                followingPostsOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;

            return { previousFeed, previousPost, previousReplies, previousUserPosts, previousUserReplies, previousFollowingPosts };
        },
        onSuccess: (_, variables, context) => {
            const feedOpts = feed();
            const postOpts = post({ hash: ref(variables.post.value.hash), postHash: ref(variables.post.value.post_hash) });
            const repliesOpts = variables.post.value.post_hash ? replies({ hash: ref(variables.post.value.post_hash) }) : undefined;
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });
            const hash = variables.post.value.hash;

            // Post with updated dislikes count
            const optimisticPost: Post
                = context.previousPost
                    ? { ...context.previousPost, dislikes: (context.previousPost.dislikes || 0) + 1 }
                    : { ...variables.post.value, dislikes: (variables.post.value.dislikes || 0) + 1 };

            // Whole replies with updated post's dislikes count
            const optimisticRepliesData = infiniteDataWithUpdatedPost({ previousPosts: context.previousReplies, updatedPost: optimisticPost });

            // Whole user posts with updated post's dislikes count
            const optimisticUserPostsData = infiniteDataWithUpdatedPost({ previousPosts: context.previousUserPosts, updatedPost: optimisticPost });

            // Whole feed with updated post's dislikes count
            const optimisticFeedData = infiniteDataWithUpdatedPost({ previousPosts: context.previousFeed, updatedPost: optimisticPost });

            // Whole following posts with updated post's dislikes count
            const optimisticFollowingPostsData = infiniteDataWithUpdatedPost({ previousPosts: context.previousFollowingPosts, updatedPost: optimisticPost });

            // Whole user replies with updated post's dislikes count (Parent or reply)
            const optimisticUserRepliesPages = context.previousUserReplies?.pages.map(page =>
                page.map(replyWithParent =>
                    replyWithParent.parent.hash === hash
                        ? { parent: optimisticPost, reply: replyWithParent.reply }
                        : replyWithParent.reply.hash === hash
                            ? { reply: optimisticPost, parent: replyWithParent.parent }
                            : replyWithParent,
                ),
            );
            const optimisticUserRepliesData: InfiniteData<ReplyWithParent[]> = {
                pageParams: context.previousUserReplies?.pageParams || [],
                pages: optimisticUserRepliesPages || [],
            };

            queryClient.setQueryData(feedOpts.queryKey, optimisticFeedData);
            queryClient.setQueryData(postOpts.queryKey, optimisticPost);
            queryClient.setQueryData(userPostsOpts.queryKey, optimisticUserPostsData);
            queryClient.setQueryData(userRepliesOpts.queryKey, optimisticUserRepliesData);
            queryClient.setQueryData(followingPostsOpts.queryKey, optimisticFollowingPostsData);
            if (repliesOpts) {
                queryClient.setQueryData(repliesOpts.queryKey, optimisticRepliesData);
            }
        },
        onError: (_, variables, context) => {
            const feedOpts = feed();
            const postOpts = post({ hash: ref(variables.post.value.hash), postHash: ref(variables.post.value.post_hash) });
            const repliesOpts = variables.post.value.post_hash ? replies({ hash: ref(variables.post.value.post_hash) }) : undefined;
            const userPostsOpts = userPosts({ userAddress: wallet.address });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });

            queryClient.setQueryData(feedOpts.queryKey, context?.previousFeed);
            queryClient.setQueryData(postOpts.queryKey, context?.previousPost);
            queryClient.setQueryData(userPostsOpts.queryKey, context?.previousUserPosts);
            queryClient.setQueryData(userRepliesOpts.queryKey, context?.previousUserReplies);
            queryClient.setQueryData(followingPostsOpts.queryKey, context?.previousFollowingPosts);
            if (repliesOpts) {
                queryClient.setQueryData(repliesOpts.queryKey, context?.previousReplies);
            }
        },
    });

    return {
        dislikePost: mutateAsync,
        txError,
        txSuccess,
    };
}
