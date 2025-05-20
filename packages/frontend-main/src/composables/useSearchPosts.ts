import type { Post } from 'api-main/types/feed';

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { refDebounced } from '@vueuse/core';
import { useQuery } from '@tanstack/vue-query';

const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

export function useSearchPosts(minQueryLength: number = 3, debounceMs: number = 300) {
    const { t } = useI18n();
    const query = ref<string>('');
    const debouncedQuery = refDebounced<string>(query, debounceMs);

    const searchPosts = async ({ signal }: { queryKey: string[]; signal: AbortSignal }) => {
        // FIXME: We should use search endpoint instead
        const rawResponse = await fetch(`${apiRoot}/feed?offset=0&limit=100`, { signal });
        const res = (await rawResponse.json()) as { status: number; rows: Post[] };

        if (res.status !== 200) {
            throw Error(t('components.SearchInput.failedToSearch'));
        }

        return res.rows.filter((post: Post) => post.message.toLowerCase().includes(debouncedQuery.value.toLowerCase()));
    };

    const {
        isLoading,
        data: posts,
        error,
        refetch,
    } = useQuery({
        queryKey: ['searchPosts', debouncedQuery],
        queryFn: searchPosts,
        enabled: false,
    });

    watch(debouncedQuery, (newVal: string) => {
        if (newVal.trim().length >= minQueryLength) {
            refetch();
        }
    });

    return { searchPosts, posts, isLoading, error, query };
}
