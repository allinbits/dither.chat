import type { Post } from 'api-main/types/feed';

import { computed, type Ref } from 'vue';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    hash: Ref<string>;
}

export const replies = (params: Params) =>
    infiniteQueryOptions({
        queryKey: computed(() => ['replies', params.hash.value]),
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/replies?hash=${params.hash.value}&offset=${pageParam}&limit=${LIMIT}`);
            const json = await res.json() as { status: number; rows: Post[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: computed(() => !!params.hash.value),
    });

export function useReplies(params: Params) {
    return useInfiniteQuery(replies(params));
}
