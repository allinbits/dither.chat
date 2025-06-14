import type { FollowUser } from 'api-main/types/follows';

import { type Ref } from 'vue';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

import { useConfigStore } from '@/stores/useConfigStore';

const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const following = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    return infiniteQueryOptions({
        queryKey: ['following', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(
                `${apiRoot}/following?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}`,
            );
            const json = (await res.json()) as { status: number; rows: FollowUser[] };
            return json.rows ?? [];
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

export function useFollowing(params: Params) {
    return useInfiniteQuery(following(params));
}
