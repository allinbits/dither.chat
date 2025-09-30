import { type Ref, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { type Post, postSchema } from 'api-main/types/feed';
import { storeToRefs } from 'pinia';

import { post } from './usePost';

import { useConfigStore } from '@/stores/useConfigStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { checkRowsSchema } from '@/utility/sanitize';

const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const userPosts = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

    const { filterAmountAtomics } = storeToRefs(useFiltersStore());
    const debouncedFilterAmount = refDebounced<string>(filterAmountAtomics, 600);
    return infiniteQueryOptions({
        queryKey: ['posts', params.userAddress, debouncedFilterAmount],
        queryFn: async ({ pageParam = 0 }) => {
            const queryClient = useQueryClient();
            const res = await fetch(`${apiRoot}/posts?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}&minQuantity=${debouncedFilterAmount.value}`);
            const json = await res.json();

            // Check if the fetched rows match the post schema
            const checkedRows: Post[] = checkRowsSchema(postSchema, json.rows ?? []);

            // Update the query cache with the posts
            checkedRows.forEach((row) => {
                const postOpts = post({ hash: ref(row.hash) });
                queryClient.setQueryData(postOpts.queryKey, row);
            });

            return checkedRows;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.userAddress.value,
        staleTime: Infinity,
    });
};

export function useUserPosts(params: Params) {
    return useInfiniteQuery(userPosts(params));
}
