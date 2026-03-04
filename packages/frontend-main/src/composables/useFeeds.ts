import { queryOptions, useQuery } from '@tanstack/vue-query';

import { useConfigStore } from '@/stores/useConfigStore';

export interface FeedInfo {
  slug: string;
  name: string;
  description: string | null;
  author: string | null;
}

export function feedsQueryOptions() {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  return queryOptions({
    queryKey: ['feeds'],
    queryFn: async (): Promise<FeedInfo[]> => {
      const res = await fetch(`${apiRoot}/feeds`);
      if (!res.ok) {
        throw new Error('Failed to fetch feeds');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeeds() {
  return useQuery(feedsQueryOptions());
}
