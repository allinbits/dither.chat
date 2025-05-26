import type { Post } from 'api-main/types/feed';

import { type Ref } from 'vue';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const userReplies = (params: Params) =>
    infiniteQueryOptions({
        queryKey: ['user-replies', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/user-replies?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}`);
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

export function useUserReplies(params: Params) {
    return useInfiniteQuery(userReplies(params));
}
