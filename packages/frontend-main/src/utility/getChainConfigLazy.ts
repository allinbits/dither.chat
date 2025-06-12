import { computed } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';

export const getChainConfigLazy = () => {
    const configStore = useConfigStore();
    return computed(() => configStore.chainConfig);
};
