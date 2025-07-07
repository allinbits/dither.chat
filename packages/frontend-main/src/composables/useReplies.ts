import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { post } from './usePost';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
const LIMIT = 15;

interface Params {
    hash: Ref<string>;
}

export const replies = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    const { filterAmountAtomics } = storeToRefs(useFiltersStore());
    const debouncedFilterAmount = refDebounced<string>(filterAmountAtomics, 600);
    return infiniteQueryOptions({
        queryKey: ['replies', params.hash, debouncedFilterAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const queryClient = useQueryClient();
            const res = await fetch(`${apiRoot}/replies?hash=${params.hash.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${debouncedFilterAmount.value}`);
            const json = (await res.json()) as { status: number; rows: Post[] };
            const rows = json.rows ?? [];
            // Update the query cache with the reply posts
            rows.forEach((row) => {
                const postOpts = post({ hash: ref(row.hash) });
                queryClient.setQueryData(postOpts.queryKey, row);
            });
            return rows;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.hash.value,
        staleTime: Infinity,
    });
};

export function useReplies(params: Params) {
    return useInfiniteQuery(replies(params));
}
