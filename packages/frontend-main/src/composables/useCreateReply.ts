import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { replies } from './useReplies';
import { useWallet } from './useWallet';

interface CreateReplyRequestMutation {
    hash: string;
    postHash: string | null;
    message: string;
    photonValue: number;
}

export function useCreateReply(
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
        mutationFn: async ({ hash, message, photonValue }: CreateReplyRequestMutation) => {
            const result = await wallet.dither.reply(
                hash,
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
            const postOpts = post({ hash: variables.hash, postHash: variables.postHash });
            const repliesOpts = replies({ hash: variables.hash });

            await queryClient.cancelQueries(postOpts);
            await queryClient.cancelQueries(repliesOpts);

            const previousPost = queryClient.getQueryData(
                postOpts.queryKey,
            ) as Post | undefined;
            const previousReplies = queryClient.getQueryData(
                repliesOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;

            return { previousReplies, previousPost };
        },
        onSuccess: (hash, variables, context) => {
            if (!hash) throw new Error('Error: No hash in TX');

            const postOpts = post({ hash: variables.hash, postHash: variables.postHash });
            const repliesOpts = replies({ hash: variables.hash });

            const optimisticNewPost = context.previousPost ? { ...context.previousPost, replies: (context.previousPost.replies || 0) + 1 } : undefined;
            const optimisticNewReply = buildNewPost(variables.message, variables.photonValue, hash);

            const newPages = context.previousReplies?.pages ? [...context.previousReplies.pages] : [];
            if (newPages.length > 0) {
                newPages[0] = [optimisticNewReply, ...newPages[0]];
            }
            else {
                newPages.push([optimisticNewReply]);
            }
            const newRepliesData: InfiniteData<Post[], unknown> = {
                pages: newPages,
                pageParams: context.previousReplies?.pageParams ?? [0],
            };

            queryClient.setQueryData(postOpts.queryKey, optimisticNewPost);
            queryClient.setQueryData(repliesOpts.queryKey, newRepliesData);
        },
        onError: (_, variables, context) => {
            const postOpts = post({ hash: variables.hash, postHash: variables.postHash });
            const repliesOpts = replies({ hash: variables.hash });

            queryClient.setQueryData(postOpts.queryKey, context?.previousPost);
            queryClient.setQueryData(repliesOpts.queryKey, context?.previousReplies);
        },
    });

    return {
        createReply: mutateAsync,
        txError,
        txSuccess,
    };
}
