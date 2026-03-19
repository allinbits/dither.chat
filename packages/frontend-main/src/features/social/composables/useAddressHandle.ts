import type { ComputedRef, Ref } from 'vue';

import { computed } from 'vue';

import { useSocialLinks } from './useSocialLinks';

interface AddressHandle {
  handle: ComputedRef<string | null>;
  platform: ComputedRef<string | null>;
}

export function useAddressHandle(address: Ref<string>): AddressHandle {
  const { data } = useSocialLinks({ address });

  const verifiedLink = computed(() => {
    const links = data.value ?? [];
    const verified = links
      .filter(l => l.status === 'verified')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return verified[0] ?? null;
  });

  const handle = computed(() => {
    if (!verifiedLink.value) return null;
    return verifiedLink.value.handle;
  });

  const platform = computed(() => {
    if (!verifiedLink.value) return null;
    return verifiedLink.value.platform;
  });

  return { handle, platform };
}
