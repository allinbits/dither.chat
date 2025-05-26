import type { Post } from 'api-main/types/feed';

import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

export const feed = () =>
    infiniteQueryOptions({
        queryKey: ['feed'],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/feed?offset=${pageParam}&limit=${LIMIT}`);
            const json = await res.json() as { status: number; rows: Post[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
    });

export function useFeed() {
    return useInfiniteQuery(feed());
}
