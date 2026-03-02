import type { QueryClient } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';
import type { Ref } from 'vue';

import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { refDebounced } from '@vueuse/core';
import { postSchema } from 'api-main/types/feed';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { hydrateSocialLinks } from '@/features/social';
import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { checkRowsSchema } from '@/utility/sanitize';

import { post } from './usePost';

const LIMIT = 15;

interface Params {
  hash: Ref<string>;
}

export function replies(params: Params, queryClient: QueryClient) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  const { filterAmountAtomics } = storeToRefs(useFiltersStore());
  const debouncedFilterAmount = refDebounced<string>(filterAmountAtomics, 600);
  return infiniteQueryOptions({
    queryKey: ['replies', params.hash, debouncedFilterAmount],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`${apiRoot}/replies?hash=${params.hash.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${debouncedFilterAmount.value}`);
      const json = await res.json();

      // Check if the fetched rows match the post schema
      const checkedRows: Post[] = checkRowsSchema(postSchema, json.rows ?? []);

      // Update the query cache with the posts
      checkedRows.forEach((row) => {
        const postOpts = post({ hash: ref(row.hash) });
        queryClient.setQueryData(postOpts.queryKey, row);
      });

      if (json.social && typeof json.social === 'object') {
        hydrateSocialLinks(queryClient, json.social);
      }

      return checkedRows;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT)
        return undefined;
      return allPages.length * LIMIT;
    },
    enabled: () => !!params.hash.value,
    staleTime: Infinity,
  });
}

export function useReplies(params: Params) {
  return useInfiniteQuery(replies(params, useQueryClient()));
}
