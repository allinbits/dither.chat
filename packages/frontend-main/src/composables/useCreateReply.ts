import type { InfiniteData } from '@tanstack/vue-query';

import type { Post, ReplyWithParent } from 'api-main/types/feed';
import type { Ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

import { fractionalDigits } from '@/utility/atomics';
import { infiniteDataWithNewItem, newPost } from '@/utility/optimisticBuilders';
import { post } from './usePost';
import { replies } from './useReplies';
import { useTxNotification } from './useTxNotification';

import { userReplies } from './useUserReplies';
import { useWallet } from './useWallet';

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

  const {
    mutateAsync,
  } = useMutation({
    mutationFn: async ({ parentPost, message, amountAtomics }: CreateReplyRequestMutation) => {
      txError.value = undefined;
      txSuccess.value = undefined;
      isToastShown.value = true;

      const msg = message.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      const result = await wallet.dither.send(
        'Reply',
        { args: [parentPost.value.hash, msg], amount: amountAtomics },
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
      if (!createdHash)
        throw new Error('Error: No hash in TX');

      const parentPostOpts = post({ hash: ref(variables.parentPost.value.hash) });
      const repliesOpts = replies({ hash: ref(variables.parentPost.value.hash) });
      const userRepliesOpts = userReplies({ userAddress: wallet.address });

      // Parent Post with updated replies count
      const optimisticParentPost: Post
        = context.previousParentPost
          ? { ...context.previousParentPost, replies: (context.previousParentPost.replies || 0) + 1 }
          : { ...variables.parentPost.value, replies: (variables.parentPost.value.replies || 0) + 1 };
      // Created Post with parent hash as post_hash
      const optimisticNewReply: Post = newPost({ message: variables.message, quantity: Decimal.fromAtomics(variables.amountAtomics, fractionalDigits).atomics, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value });
      // Created Post in ReplyWithParent
      const optimisticNewUserReply: ReplyWithParent = {
        reply: newPost(
          { message: variables.message, quantity: Decimal.fromAtomics(variables.amountAtomics, fractionalDigits).atomics, hash: createdHash, postHash: variables.parentPost.value.hash, author: wallet.address.value },
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
