import type { Post } from 'api-main/types/feed';
import { useQuery } from '@tanstack/vue-query';
import { refDebounced } from '@vueuse/core';
import { postSchema } from 'api-main/types/feed';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { checkRowsSchema } from '@/utility/sanitize';

export function useSearchPosts(minQueryLength: number = 3, debounceMs: number = 300) {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  const { t } = useI18n();
  const query = ref<string>('');
  const debouncedQuery = refDebounced<string>(query, debounceMs);
  const { filterAmountAtomics } = storeToRefs(useFiltersStore());
  const debouncedFilterAmount = refDebounced<string>(filterAmountAtomics, 600);

  const searchPosts = async ({ queryKey, signal }: { queryKey: string[]; signal: AbortSignal }) => {
    const res = await fetch(`${apiRoot}/search?text=${queryKey[1]}&minQuantity=${debouncedFilterAmount.value}`, { signal });
    if (res.status !== 200) {
      throw new Error(t('components.SearchInput.failedToSearch'));
    }
    const json = await res.json();

    // Check if the fetched rows match the post schema
    const checkedRows: Post[] = checkRowsSchema(postSchema, json.rows ?? []);

    return checkedRows;
  };

  const {
    isLoading,
    data: posts,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchPosts', debouncedQuery, debouncedFilterAmount.value.toString()],
    queryFn: searchPosts,
    enabled: false,
    retry: false,
  });

  watch(debouncedQuery, (newVal: string) => {
    if (!newVal || newVal.length <= 0) {
      return;
    }

    if (newVal.trim().length >= minQueryLength) {
      refetch();
    }
  });

  return { searchPosts, posts, isLoading, error, query };
}
