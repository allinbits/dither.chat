import type { Post } from 'api-main/types/feed';

import { onBeforeUnmount, ref, watch } from 'vue';
import { refDebounced } from '@vueuse/core';

const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

export function useSearchPosts(minQueryLength: number = 3, debounceMs: number = 200) {
    const query = ref<string>('');
    const debouncedQuery = refDebounced<string>(query, debounceMs);
    const results = ref<Post[]>([]);
    const isLoading = ref<boolean>(false);
    const error = ref<Error | null>(null);
    let controller: AbortController | null = null;

    const searchPosts = async (query: string) => {
        if (controller) {
            controller.abort('cancel current search');
        }

        if (query.trim().length < minQueryLength) {
            results.value = [];
            return;
        }

        controller = new AbortController();
        isLoading.value = true;
        error.value = null;

        try {
            // FIXME: We should use search endpoint instead
            const rawResponse = await fetch(`${apiRoot}/feed?offset=0&limit=100`, { signal: controller.signal });
            const res = (await rawResponse.json()) as { status: number; rows: Post[] };

            if (res.status !== 200) {
                throw Error('failed to search');
            }

            results.value = res.rows.filter((post: Post) => post.message.toLowerCase().includes(query.toLowerCase()));
        }
        catch (e) {
            error.value = e as Error;
        }
        finally {
            isLoading.value = false;
        }
    };

    watch(debouncedQuery, (debouncedQueryValue: string) => {
        searchPosts(debouncedQueryValue);
    });

    onBeforeUnmount(() => {
        if (controller) {
            controller.abort('component unmounted');
        }
    });

    return { searchPosts, results, isLoading, error, query };
}
