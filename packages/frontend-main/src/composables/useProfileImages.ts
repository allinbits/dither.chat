import type { Ref } from 'vue';

import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';

export function useProfileImages(userAddress: Ref<string>) {
  const mode = useColorMode();

  const avatarUrl = computed(() =>
    userAddress.value
      ? `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${userAddress.value}`
      : null,
  );

  const avatarImageClass = computed(() =>
    mode.value === 'dark' ? 'filter-[invert(0.96)]' : '',
  );

  return {
    avatarUrl,
    avatarImageClass,
  };
}
