import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { useChain } from './useChain';
import { post } from './usePost';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';

const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const userPosts = (params: Params) => {
    const { getAtomicsAmount } = useChain();
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    const { filterAmount } = storeToRefs(useFiltersStore());
    const debouncedFilterAmount = refDebounced<number>(filterAmount, 600);
    return infiniteQueryOptions({
        queryKey: ['posts', params.userAddress, debouncedFilterAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const queryClient = useQueryClient();
            const res = await fetch(`${apiRoot}/posts?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${getAtomicsAmount(debouncedFilterAmount.value.toString(), 'uphoton')}`);
            const json = (await res.json()) as { status: number; rows: Post[] };
            const rows = json.rows ?? [];
            // Update the query cache with the users posts
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
        enabled: () => !!params.userAddress.value,
        staleTime: Infinity,
    });
};

export function useUserPosts(params: Params) {
    return useInfiniteQuery(userPosts(params));
}
