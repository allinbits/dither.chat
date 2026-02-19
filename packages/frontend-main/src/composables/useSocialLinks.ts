import type { Ref } from 'vue';

import { queryOptions, useQuery } from '@tanstack/vue-query';

import { useConfigStore } from '@/stores/useConfigStore';

export interface SocialLink {
  id: number;
  handle: string;
  platform: string;
  status: 'pending' | 'verified' | 'failed';
  error_reason?: string | null;
  proof_url?: string;
  created_at: string;
}

interface Params {
  address: Ref<string>;
}

export function socialLinks(params: Params) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  return queryOptions({
    queryKey: ['social-links', params.address],
    queryFn: async () => {
      const res = await fetch(
        `${apiRoot}/social/links?address=${params.address.value}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch social links');
      const json = await res.json();
      return (json.rows ?? []) as SocialLink[];
    },
    enabled: () => !!params.address.value,
    staleTime: 10_000,
  });
}

export function useSocialLinks(params: Params) {
  return useQuery(socialLinks(params));
}
