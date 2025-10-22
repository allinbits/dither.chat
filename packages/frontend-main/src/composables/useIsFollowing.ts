import type { Ref } from 'vue';

import { queryOptions, useQuery } from '@tanstack/vue-query';

import { useConfigStore } from '@/stores/useConfigStore';

interface Params {
  followerAddress: Ref<string>;
  followingAddress: Ref<string>;
}

export function isFollowing(params: Params) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  return queryOptions({
    queryKey: ['is-following', params.followerAddress, params.followingAddress],
    queryFn: async () => {
      const url = `${apiRoot}/is-following?follower=${params.followerAddress.value}&following=${params.followingAddress.value}`;

      const rawResponse = await fetch(url);
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
}

export function useIsFollowing(params: Params) {
  return useQuery(isFollowing(params));
}
