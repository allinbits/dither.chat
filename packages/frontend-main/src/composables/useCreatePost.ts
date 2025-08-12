import type { InfiniteData } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';

import { Decimal } from '@cosmjs/math';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

import { infiniteDataWithNewItem, newPost } from '@/utility/optimisticBuilders';

import { feed } from './useFeed';
import { useFractionalDigits } from './useFractionalDigits';
import { useTxNotification } from './useTxNotification';
import { userPosts } from './useUserPosts';
import { useWallet } from './useWallet';
interface CreatePostRequestMutation {
  message: string;
  amountAtomics: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const fractionalDigits = useFractionalDigits();
  const txError = ref<string>();
  const txSuccess = ref<string>();
  const isToastShown = ref(false);
  useTxNotification('Post', txSuccess, txError);

  const {
    mutateAsync,
  } = useMutation({
    mutationFn: async ({ message, amountAtomics }: CreatePostRequestMutation) => {
      txError.value = undefined;
      txSuccess.value = undefined;
      isToastShown.value = true;

      const sanitizedMessage = message.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      const result = await wallet.dither.send(
        'Post',
        { args: [sanitizedMessage], amount: amountAtomics },
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
    onMutate: async () => {
      const feedOpts = feed(queryClient);
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
      if (!hash)
        throw new Error('Error: No hash in TX');

      const feedOpts = feed(queryClient);
      const userPostsOpts = userPosts({ userAddress: wallet.address });

      // Created Post
      const optimisticNewPost: Post = newPost({
        message: variables.message,
        quantity: Decimal.fromAtomics(variables.amountAtomics, fractionalDigits).atomics,
        hash,
        author: wallet.address.value,
        postHash: null,
      });
      const newFeedData = infiniteDataWithNewItem<Post>({ previousItems: context.previousFeed, newItem: optimisticNewPost });
      const newUserPostsData = infiniteDataWithNewItem<Post>({ previousItems: context.previousUserPosts, newItem: optimisticNewPost });

      queryClient.setQueryData(feedOpts.queryKey, newFeedData);
      queryClient.setQueryData(userPostsOpts.queryKey, newUserPostsData);
    },
    onError: (_, __, context) => {
      const feedOpts = feed(queryClient);
      const userPostsOpts = userPosts({ userAddress: wallet.address });
      queryClient.setQueryData(feedOpts.queryKey, context?.previousFeed);
      queryClient.setQueryData(userPostsOpts.queryKey, context?.previousUserPosts);
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
