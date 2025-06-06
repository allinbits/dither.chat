import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { post } from './usePost';

import { useFiltersStore } from '@/stores/useFiltersStore';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    hash: Ref<string>;
}

export const replies = (params: Params) => {
    const queryClient = useQueryClient();
    const { minSendAmount } = storeToRefs(useFiltersStore());
    const debouncedMinSendAmount = refDebounced<number>(minSendAmount, 600);
    return infiniteQueryOptions({
        queryKey: ['replies', params.hash, debouncedMinSendAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/replies?hash=${params.hash.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${Math.trunc(debouncedMinSendAmount.value)}`);
            const json = await res.json() as { status: number; rows: Post[] };
            const rows = json.rows ?? [];
            // We update one post when doing an action like/dislike/reply in PostItem, RepliesGroupItem PostReplyItem
            // We prevent fetching post many times by populating the fetched replies into each post
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
