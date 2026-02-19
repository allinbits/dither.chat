import type { Post } from 'api-main/types/feed';
import type { Ref } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

import { post } from './usePost';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

interface RepostPostRequestMutation {
  post: Ref<Post>;
  amountAtomics: string;
}

export function useRepostPost(
) {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const txError = ref<string>();
  const txSuccess = ref<string>();
  const isToastShown = ref(false);
  useTxNotification('Repost', txSuccess, txError);

  const {
    mutateAsync,
  } = useMutation({
    mutationFn: async ({ post, amountAtomics }: RepostPostRequestMutation) => {
      txError.value = undefined;
      txSuccess.value = undefined;
      isToastShown.value = true;

      const result = await wallet.dither.send(
        'Repost',
        { args: [post.value.hash], amount: amountAtomics },
      );

      if (!result.broadcast) {
        txError.value = result.msg;
        throw new Error(result.msg);
      }
      txSuccess.value = result.tx?.transactionHash;
    },
    onMutate: async (variables) => {
      const postOpts = post({ hash: ref(variables.post.value.hash) });

      await Promise.all([
        queryClient.cancelQueries(postOpts),
      ]);

      const previousPost = queryClient.getQueryData(
        postOpts.queryKey,
      ) as Post | undefined;

      return {
        previousPost,
      };
    },
    onSuccess: (_, variables, context) => {
      const postOpts = post({ hash: ref(variables.post.value.hash) });
      // Post with updated reposts count (integer, not burnt amount)
      const optimisticPost: Post
        = context.previousPost
          ? { ...context.previousPost, reposts: (context.previousPost.reposts ?? 0) + 1 }
          : { ...variables.post.value, reposts: (variables.post.value.reposts ?? 0) + 1 };

      queryClient.setQueryData(postOpts.queryKey, optimisticPost);
    },
    onError: (_, variables, context) => {
      const postOpts = post({ hash: ref(variables.post.value.hash) });
      queryClient.setQueryData(postOpts.queryKey, context?.previousPost);
    },
    onSettled: () => {
      isToastShown.value = false;
    },
  });

  return {
    repostPost: mutateAsync,
    txError,
    txSuccess,
  };
}
