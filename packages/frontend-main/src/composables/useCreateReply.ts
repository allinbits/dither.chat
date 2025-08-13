import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';
import { replies } from './useReplies';
import { useTxNotification } from './useTxNotification';
import { userReplies } from './useUserReplies';
import { useWallet } from './useWallet';

import { fractionalDigits } from '@/utility/atomics';
import { infiniteDataWithNewItem, newPost } from '@/utility/optimisticBuilders';

interface CreateReplyRequestMutation {
    parentPost: Ref<Post>;
    message: string;
    amountAtomics: string;
}

export function useCreateReply(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Reply', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ parentPost, message, amountAtomics }: CreateReplyRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Reply',
                { args: [parentPost.value.hash, message], amount: amountAtomics },
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
        onSuccess: (createdHash, variables) => {
            if (!createdHash) throw new Error('Error: No hash in TX');

            const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash) });
            const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
            const userRepliesOpts = userReplies({ userAddress: wallet.address });

            const previousParentPost = queryClient.getQueryData(parentPostOpts.queryKey);
            const previousReplies = queryClient.getQueryData(repliesOpts.queryKey);
            const previousUserReplies = queryClient.getQueryData(userRepliesOpts.queryKey);

            // Parent Post with updated replies count
            const newParentPost: Post
                = previousParentPost
                    ? { ...previousParentPost, replies: (previousParentPost.replies || 0) + 1 }
                    : { ...variables.parentPost.value, replies: (variables.parentPost.value.replies || 0) + 1 };
            // Created Post with parent hash as post_hash
            const newReply: Post = newPost({ message: variables.message, quantity: Decimal.fromAtomics(variables.amountAtomics, fractionalDigits).atomics, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value });
            // Created Post in ReplyWithParent
            const newUserReply: ReplyWithParent = {
                reply: newPost(
                    { message: variables.message, quantity: Decimal.fromAtomics(variables.amountAtomics, fractionalDigits).atomics, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value },
                ),
                parent: newParentPost,
            };

            const newRepliesData = infiniteDataWithNewItem<Post>({ previousItems: previousReplies, newItem: newReply });
            const newUserRepliesData = infiniteDataWithNewItem<ReplyWithParent>({ previousItems: previousUserReplies, newItem: newUserReply });

            queryClient.setQueryData(parentPostOpts.queryKey, newParentPost);
            queryClient.setQueryData(repliesOpts.queryKey, newRepliesData);
            queryClient.setQueryData(userRepliesOpts.queryKey, newUserRepliesData);
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        createReply: mutateAsync,
        txError,
        txSuccess,
    };
}
