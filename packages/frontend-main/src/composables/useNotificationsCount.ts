import type { Ref } from 'vue';

import { queryOptions, useQuery } from '@tanstack/vue-query';

import { useConfigStore } from '@/stores/useConfigStore';

interface Params {
    userAddress: Ref<string>;
}

export const notificationsCount = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    return queryOptions({
        queryKey: ['notifications-count', params.userAddress],
        queryFn: async () => {
            const res = await fetch(
                `${apiRoot}/notifications-count?address=${params.userAddress.value}`,
                {
                    credentials: 'include',
                },
            );

            const json = (await res.json()) as { status: number; count: number };
            return json.count ?? 0;
        },
        enabled: () => !!params.userAddress.value,
    });
};

export function useNotificationsCount(params: Params) {
    return useQuery(notificationsCount(params));
}
