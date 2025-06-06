import type { ReplyWithParent } from 'api-main/types/feed';

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

export const userReplies = (params: Params) => {
    const { minSendAmount } = storeToRefs(useFiltersStore());
    const debouncedMinSendAmount = refDebounced<number>(minSendAmount, 600);
    return infiniteQueryOptions({
        queryKey: ['user-replies', params.userAddress, debouncedMinSendAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/user-replies?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${Math.trunc(debouncedMinSendAmount.value)}`);
            const json = await res.json() as { status: number; rows: ReplyWithParent[] };
            const rows = json.rows ?? [];
            // We update one post when doing an action like/dislike/reply in PostItem, RepliesGroupItem PostReplyItem
            // We prevent fetching post many times by populating the fetched feed into each reply and parent post
            // TODO: set the good query data for replies and parents
            // rows.forEach((row) => {
            //     if (row.parent.hash === params.hash) {
            //         const postOpts = post({ hash: ref(row.parent.hash) });
            //         queryClient.setQueryData(postOpts.queryKey, row.parent);
            //     }
            //     else {
            //         const postOpts = post({ hash: ref(row.reply.hash) });
            //         queryClient.setQueryData(postOpts.queryKey, row.reply);
            //     }
            // });
            return rows;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.userAddress.value,
        retry: false,
        staleTime: Infinity,
    });
};

export function useUserReplies(params: Params) {
    return useInfiniteQuery(userReplies(params));
}
