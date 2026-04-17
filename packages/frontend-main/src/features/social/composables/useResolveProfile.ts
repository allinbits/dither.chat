import type { Ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';

interface ResolveResult {
  address: string;
  handle: string;
  platform: string;
}

function isAddress(value: string): boolean {
  return value.length === 44 && !value.includes('@');
}

export function useResolveProfile(identifier: Ref<string>) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  const isHandle = computed(() => !isAddress(identifier.value));

  const { data, isLoading, isError } = useQuery({
    queryKey: ['social-resolve', identifier],
    queryFn: async (): Promise<ResolveResult> => {
      const handle = identifier.value.startsWith('@')
        ? identifier.value.slice(1)
        : identifier.value;

      const res = await fetch(`${apiRoot}/social/resolve?handle=${encodeURIComponent(handle)}`);
      if (!res.ok) {
        throw new Error('Handle not found');
      }
      return res.json();
    },
    enabled: () => isHandle.value && identifier.value.length > 0,
    staleTime: Infinity,
    retry: false,
  });

  const address = computed(() => {
    if (!isHandle.value) return identifier.value;
    return data.value?.address ?? '';
  });

  const isPending = computed(() => isHandle.value && isLoading.value);
  const notFound = computed(() => isHandle.value && isError.value);

  return { address, isPending, notFound };
}
