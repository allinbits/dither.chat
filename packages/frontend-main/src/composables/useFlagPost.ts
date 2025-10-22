import type { Post } from 'api-main/types/feed';

import type { Ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

import { addAtomics } from '@/utility/atomics';
import { post } from './usePost';
import { useTxNotification } from './useTxNotification';

import { useWallet } from './useWallet';

interface FlagPostRequestMutation {
  post: Ref<Post>;
  amountAtomics: string;
}

export function useFlagPost(
) {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const txError = ref<string>();
  const txSuccess = ref<string>();
  const isToastShown = ref(false);
  useTxNotification('Flag', txSuccess, txError);

  const {
    mutateAsync,
  } = useMutation({
    mutationFn: async ({ post, amountAtomics }: FlagPostRequestMutation) => {
      txError.value = undefined;
      txSuccess.value = undefined;
      isToastShown.value = true;

      const result = await wallet.dither.send(
        'Flag',
        { args: [post.value.hash], amount: amountAtomics },
      );

      if (!result.broadcast) {
        txError.value = result.msg;
        throw new Error(result.msg);
      }
      txSuccess.value = result.tx?.transactionHash;
      if (txSuccess.value) {
        return txSuccess.value;
      }
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
      // Post with updated flags_burnt
      const optimisticPost: Post
        = context.previousPost
          ? { ...context.previousPost, flags_burnt: addAtomics((context.previousPost.flags_burnt ?? 0).toString(), variables.amountAtomics) }
          : { ...variables.post.value, flags_burnt: addAtomics((variables.post.value.flags_burnt ?? 0).toString(), variables.amountAtomics) };

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
    flagPost: mutateAsync,
    txError,
    txSuccess,
  };
}
