import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { feed } from './useFeed';
import { useTxNotification } from './useTxNotification';
import { userPosts } from './useUserPosts';
import { useWallet } from './useWallet';

import { fractionalDigits } from '@/utility/atomics';
import { infiniteDataWithNewItem, newPost as newPostFn } from '@/utility/optimisticBuilders';

interface CreatePostRequestMutation {
    message: string;
    amountAtomics: string;
}

export function useCreatePost(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Post', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ message, amountAtomics }: CreatePostRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Post',
                { args: [message], amount: amountAtomics },
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
        onSuccess: (hash, variables) => {
            if (!hash) throw new Error('Error: No hash in TX');

            const feedOpts = feed(queryClient);
            const userPostsOpts = userPosts({ userAddress: wallet.address });

            const newPost: Post = newPostFn({
                message: variables.message,
                quantity: Decimal.fromAtomics(variables.amountAtomics, fractionalDigits).atomics,
                hash,
                author: wallet.address.value,
                postHash: null,
            });

            const previousFeed = queryClient.getQueryData<InfiniteData<Post[]>>(feedOpts.queryKey);
            const previousUserPosts = queryClient.getQueryData<InfiniteData<Post[]>>(userPostsOpts.queryKey);

            const newFeedData = infiniteDataWithNewItem<Post>({
                previousItems: previousFeed,
                newItem: newPost,
            });

            const newUserPostsData = infiniteDataWithNewItem({
                previousItems: previousUserPosts,
                newItem: newPost,
            });

            queryClient.setQueryData(feedOpts.queryKey, newFeedData);
            queryClient.setQueryData(userPostsOpts.queryKey, newUserPostsData);
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        createPost: mutateAsync,
        txError,
        txSuccess,
    };
}
