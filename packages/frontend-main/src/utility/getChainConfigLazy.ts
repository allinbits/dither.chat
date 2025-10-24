import { computed } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';

export function getChainConfigLazy() {
  const configStore = useConfigStore();
  return computed(() => configStore.envConfig.chainConfig);
}
