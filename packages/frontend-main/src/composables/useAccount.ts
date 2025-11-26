import type { Account } from 'api-main/types/account';
import type { Ref } from 'vue';

import { queryOptions, useQuery } from '@tanstack/vue-query';

import { useConfigStore } from '@/stores/useConfigStore';

interface Params {
  address: Ref<string>;
}

export function account(params: Params) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  return queryOptions({
    queryKey: ['account', params.address],
    queryFn: async () => {
      const url = `${apiRoot}/account?address=${params.address.value}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => undefined);
        throw new Error(errorData?.error || 'Failed to fetch account');
      }

      const result = await response.json();
      if (result.status === 404 || !result.rows?.length) {
        throw new Error('Account not found');
      }

      return (result.rows[0] as Account);
    },
    enabled: () => !!params.address.value,
    staleTime: Infinity,
  });
}

export function useAccount(params: Params) {
  return useQuery(account(params));
}
