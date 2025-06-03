import type { Post } from 'api-main/types/feed';

import { type Ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { useFiltersStore } from '@/stores/useFiltersStore';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const userPosts = (params: Params) => {
    const { minSendAmount } = storeToRefs(useFiltersStore());
    const debouncedMinSendAmount = refDebounced<number>(minSendAmount, 600);
    return infiniteQueryOptions({
        queryKey: ['posts', params.userAddress, debouncedMinSendAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/posts?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${Math.trunc(debouncedMinSendAmount.value)}`);
            const json = await res.json() as { status: number; rows: Post[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.userAddress.value,
    });
};

export function useUserPosts(params: Params) {
    return useInfiniteQuery(userPosts(params));
}
