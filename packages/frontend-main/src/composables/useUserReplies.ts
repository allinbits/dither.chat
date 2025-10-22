import type { ReplyWithParent } from 'api-main/types/feed';
import type { Ref } from 'vue';

import type { RawRow } from '@/utility/sanitize';

import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { refDebounced } from '@vueuse/core';
import { postSchema } from 'api-main/types/feed';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { checkRowsSchema } from '@/utility/sanitize';

import { post } from './usePost';

const LIMIT = 15;

interface RawUserRepliesRow {
  reply: RawRow;
  parent: RawRow;
}
interface Params {
  userAddress: Ref<string>;
}

export function userReplies(params: Params) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  const { filterAmountAtomics } = storeToRefs(useFiltersStore());
  const debouncedFilterAmount = refDebounced<string>(filterAmountAtomics, 600);
  return infiniteQueryOptions({
    queryKey: ['user-replies', params.userAddress, debouncedFilterAmount],
    queryFn: async ({ pageParam = 0 }) => {
      const queryClient = useQueryClient();
      const res = await fetch(`${apiRoot}/user-replies?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${debouncedFilterAmount.value}`);
      const json = await res.json();

      // Check if the fetched rows match the post schema
      const checkedRows: ReplyWithParent[] = (json.rows ?? []).flatMap((row: RawUserRepliesRow) => {
        const checkedReply = checkRowsSchema(postSchema, [row.reply])[0];
        const checkedParent = checkRowsSchema(postSchema, [row.parent])[0];
        return [{
          reply: checkedReply,
          parent: checkedParent,
        }];
      });
      // Update the query cache with the parent posts and reply posts
      checkedRows.forEach((row) => {
        const parentPostOpts = post({ hash: ref(row.parent.hash) });
        const replyPostOpts = post({ hash: ref(row.reply.hash) });
        queryClient.setQueryData(parentPostOpts.queryKey, row.parent);
        queryClient.setQueryData(replyPostOpts.queryKey, row.reply);
      });

      return checkedRows;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT)
        return undefined;
      return allPages.length * LIMIT;
    },
    enabled: () => !!params.userAddress.value,
    staleTime: Infinity,
  });
}

export function useUserReplies(params: Params) {
  return useInfiniteQuery(userReplies(params));
}
