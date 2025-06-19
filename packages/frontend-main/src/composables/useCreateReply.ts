import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { replies } from './useReplies';
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
            const result = await wallet.dither.send(
                'Reply',
                { args: [parentPost.value.hash, message], amount: BigInt(photonValue).toString() },
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
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            await Promise.all([
                queryClient.cancelQueries(parentPostOpts),
                queryClient.cancelQueries(repliesOpts),
                queryClient.cancelQueries(userRepliesOpts),
            ]);

            const previousParentPost = queryClient.getQueryData(
                parentPostOpts.queryKey,
            ) as Post | undefined;
            const previousReplies = queryClient.getQueryData(
                repliesOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousUserReplies = queryClient.getQueryData(
                userRepliesOpts.queryKey,
            ) as InfiniteData<ReplyWithParent[], unknown> | undefined;

            return { previousParentPost, previousReplies, previousUserReplies };
        },
        onSuccess: (createdHash, variables, context) => {
            if (!createdHash) throw new Error('Error: No hash in TX');

            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            // Parent Post with updated replies count
            const optimisticParentPost: Post
                = context.previousParentPost
                    ? { ...context.previousParentPost, replies: (context.previousParentPost.replies || 0) + 1 }
                    : { ...variables.parentPost.value, replies: (variables.parentPost.value.replies || 0) + 1 };
            // Created Post with parent hash as post_hash
            const optimisticNewReply: Post = newPost({ message: variables.message, quantity: variables.photonValue, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value });
            // Created Post in ReplyWithParent
            const optimisticNewUserReply: ReplyWithParent = {
                reply: newPost(
                    { message: variables.message, quantity: variables.photonValue, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value },
                ),
                parent: optimisticParentPost,
            };

            const newRepliesData = infiniteDataWithNewItem<Post>({ previousItems: context.previousReplies, newItem: optimisticNewReply });
            const newUserRepliesData = infiniteDataWithNewItem<ReplyWithParent>({ previousItems: context.previousUserReplies, newItem: optimisticNewUserReply });

            queryClient.setQueryData(parentPostOpts.queryKey, optimisticParentPost);
            queryClient.setQueryData(repliesOpts.queryKey, newRepliesData);
            queryClient.setQueryData(userRepliesOpts.queryKey, newUserRepliesData);
        },
        onError: (_, variables, context) => {
            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

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
