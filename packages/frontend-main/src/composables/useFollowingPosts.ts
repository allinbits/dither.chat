import type { Post } from 'api-main/types/feed';

import { type Ref } from 'vue';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const followingPosts = (params: Params) =>
    infiniteQueryOptions({
        queryKey: ['posts', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/following-posts?address=${params.userAddress}&offset=${pageParam}&limit=${LIMIT}`);
            const json = await res.json() as { status: number; rows: Post[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.userAddress,
    });

export function useFollowingPosts(params: Params) {
    return useInfiniteQuery(followingPosts(params));
}
