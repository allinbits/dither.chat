import type { Post } from 'api-main/types/feed';

import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';

const LIMIT = 15;

export const feed = () => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    const { minSendAmount } = storeToRefs(useFiltersStore());
    const debouncedMinSendAmount = refDebounced<number>(minSendAmount, 600);
    return infiniteQueryOptions({
        queryKey: ['feed', debouncedMinSendAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(
                `${apiRoot}/feed?offset=${pageParam}&limit=${LIMIT}&minQuantity=${Math.trunc(debouncedMinSendAmount.value)}`,
            );
            const json = (await res.json()) as { status: number; rows: Post[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
    });
};

export function useFeed() {
    return useInfiniteQuery(feed());
}
