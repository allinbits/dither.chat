import type { ComputedRef, Ref } from 'vue';

import { computed } from 'vue';

import { useSocialLinks } from './useSocialLinks';

export function useAddressHandle(address: Ref<string>): ComputedRef<string | null> {
  const { data } = useSocialLinks({ address });

  return computed(() => {
    const links = data.value ?? [];
    const verified = links
      .filter(l => l.status === 'verified')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (!verified.length) return null;
    return verified[0].handle;
  });
}
