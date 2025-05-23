import type { Post } from 'api-main/types/feed';

import { useInfiniteQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    hash: string;
}

export function useReplies(params: Params) {
    const query = useInfiniteQuery({
        queryKey: ['replies', params.hash],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/replies?hash=${params.hash}&offset=${pageParam}&limit=${LIMIT}`);
            const json = await res.json() as { status: number; rows: Post[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
    });

    return query;
}
