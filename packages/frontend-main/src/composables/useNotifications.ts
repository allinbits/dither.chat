import type { Ref } from 'vue';

import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';
import { type Notification, notificationSchema } from 'api-main/types/notifications';

import { useConfigStore } from '@/stores/useConfigStore';
import { checkRowsSchema } from '@/utility/sanitize';

const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const notifications = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    return infiniteQueryOptions({
        queryKey: ['notifications', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(
                `${apiRoot}/notifications?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}`,
                {
                    credentials: 'include',
                },
            );
            const json = await res.json();
            // Check if the fetched rows match the notification schema
            const checkedRows: Notification[] = checkRowsSchema(notificationSchema, json.rows ?? []);
            return checkedRows;
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

export function useNotifications(params: Params) {
    return useInfiniteQuery(notifications(params));
}
