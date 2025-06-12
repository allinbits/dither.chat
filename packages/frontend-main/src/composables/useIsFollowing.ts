import { type Ref } from 'vue';
import { queryOptions, useQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';

interface Params {
    followerAddress: Ref<string>;
    followingAddress: Ref<string>;
}

export const isFollowing = (params: Params) =>
    queryOptions({
        queryKey: ['is-following', params.followerAddress, params.followingAddress],
        queryFn: async () => {
            const url = `${apiRoot}/is-following?follower=${params.followerAddress.value}&following=${params.followingAddress.value}`;

            const rawResponse = await fetch(url);
            console.log('rawResponserawResponse', rawResponse);
            if (!rawResponse.ok) {
                throw new Error('Failed to fetch isFollowing');
            }

            const result = await rawResponse.json();
            if (result.status === 404 || !result.rows?.length) {
                return false;
            }

            return true;
        },
        enabled: () => !!params.followerAddress.value && !!params.followingAddress.value,
        staleTime: Infinity,
    });

export function useIsFollowing(params: Params) {
    return useQuery(isFollowing(params));
}
