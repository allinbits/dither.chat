import type { Notification } from 'api-main/types/notifications';
import type { Ref } from 'vue';

import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const notifications = (params: Params) =>
    infiniteQueryOptions({
        queryKey: ['notifications', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/notifications?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}`);
            const json = await res.json() as { status: number; rows: Notification[] };
            return json.rows ?? [];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.userAddress.value,
    });

export function useNotifications(params: Params) {
    return useInfiniteQuery(notifications(params));
}
