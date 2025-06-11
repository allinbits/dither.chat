import type { Post } from 'api-main/types/feed';

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { refDebounced } from '@vueuse/core';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';

export function useSearchPosts(minQueryLength: number = 3, debounceMs: number = 300) {
    const configStore = useConfigStore();
    const apiRoot = configStore.config.apiRoot ?? 'http://localhost:3000';

    const { t } = useI18n();
    const query = ref<string>('');
    const debouncedQuery = refDebounced<string>(query, debounceMs);
    const { minSendAmount } = storeToRefs(useFiltersStore());
    const debouncedMinSendAmount = refDebounced<number>(minSendAmount, 600);

    const searchPosts = async ({ queryKey, signal }: { queryKey: string[]; signal: AbortSignal }) => {
        // FIXME: We should use search endpoint instead
        const rawResponse = await fetch(`${apiRoot}/search?text=${queryKey[1]}&minQuantity=${Math.trunc(debouncedMinSendAmount.value)}`, { signal });
        const res = (await rawResponse.json()) as { status: number; rows: Post[] };

        if (res.status !== 200) {
            throw Error(t('components.SearchInput.failedToSearch'));
        }

        return res.rows;
    };

    const {
        isLoading,
        data: posts,
        error,
        refetch,
    } = useQuery({
        queryKey: ['searchPosts', debouncedQuery, debouncedMinSendAmount.value.toString()],
        queryFn: searchPosts,
        enabled: false,
        retry: false,
    });

    watch(debouncedQuery, (newVal: string) => {
        if (newVal.trim().length >= minQueryLength) {
            refetch();
        }
    });

    return { searchPosts, posts, isLoading, error, query };
}
