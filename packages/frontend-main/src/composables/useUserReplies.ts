import type { ReplyWithParent } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { post } from './usePost';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';

const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const userReplies = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    const { minSendAmount } = storeToRefs(useFiltersStore());
    const debouncedMinSendAmount = refDebounced<number>(minSendAmount, 600);
    return infiniteQueryOptions({
        queryKey: ['user-replies', params.userAddress, debouncedMinSendAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const queryClient = useQueryClient();
            const res = await fetch(`${apiRoot}/user-replies?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${Math.trunc(debouncedMinSendAmount.value)}`);
            const json = (await res.json()) as { status: number; rows: ReplyWithParent[] };
            const rows = json.rows ?? [];
            // Update the query cache with the parent posts and reply posts
            rows.forEach((row) => {
                const parentPostOpts = post({ hash: ref(row.parent.hash) });
                const replyPostOpts = post({ hash: ref(row.reply.hash) });
                queryClient.setQueryData(parentPostOpts.queryKey, row.parent);
                queryClient.setQueryData(replyPostOpts.queryKey, row.reply);
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

export function useUserReplies(params: Params) {
    return useInfiniteQuery(userReplies(params));
}
