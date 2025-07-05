import type { QueryClient } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { post } from './usePost';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';

const LIMIT = 15;

export const feed = (queryClient: QueryClient) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    const { filterAmountAtomics } = storeToRefs(useFiltersStore());
    const debouncedFilterAmount = refDebounced<string>(filterAmountAtomics, 600);

    return infiniteQueryOptions({
        queryKey: ['feed', debouncedFilterAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(
                `${apiRoot}/feed?offset=${pageParam}&limit=${LIMIT}&minQuantity=${debouncedFilterAmount.value}`,
            );
            const json = (await res.json()) as { status: number; rows: Post[] };
            const rows = json.rows ?? [];
            // Update the query cache with the feed posts
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
        staleTime: Infinity,
    });
};

export function useFeed() {
    return useInfiniteQuery(feed(useQueryClient()));
}
