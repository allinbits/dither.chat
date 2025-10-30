import type { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';

import { queryOptions, useQuery } from '@tanstack/vue-query';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { computed } from 'vue';

import { useWalletStateStore } from '@/stores/useWalletStateStore';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

interface Grant {
  authorization: {
    '@type': string;
    'spend_limit'?: Coin[];
    'allow_list'?: string[];
  };
  expiration: string;
}

interface GrantsResponse {
  grants: Grant[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

export function useAuthzGrants(grantee: string) {
  const chainInfo = getChainConfigLazy();
  const walletState = useWalletStateStore();

  const granter = computed(() => walletState.address);

  const queryAuthzGrants = async () => {
    if (!granter.value) {
      return null;
    }

    try {
      const restUrl = chainInfo.value.rest;

      const response = await fetch(
        `${restUrl}/cosmos/authz/v1beta1/grants?granter=${granter.value}&grantee=${grantee}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to query grants: ${response.statusText}`);
      }

      const data: GrantsResponse = await response.json();

      return data;
    } catch (error) {
      console.error('Error querying authz grants:', error);
      throw error;
    }
  };

  const query = useQuery(
    queryOptions({
      queryKey: ['authz-grants', granter, grantee],
      queryFn: queryAuthzGrants,
      enabled: computed(() => !!granter.value && !!grantee),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    }),
  );

  const hasActiveGrant = computed(() => {
    if (!query.data.value || !query.data.value.grants || query.data.value.grants.length === 0) {
      return false;
    }

    return query.data.value.grants.some(grant => grant.authorization['@type'] === SendAuthorization.typeUrl);
  });

  return {
    ...query,
    hasActiveGrant,
    refetch: query.refetch,
  };
}
