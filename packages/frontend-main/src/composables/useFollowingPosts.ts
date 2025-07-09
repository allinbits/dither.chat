import { type Ref, ref } from 'vue';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { type Post, postSchema } from 'api-main/types/feed';

import { post } from './usePost';

import { useConfigStore } from '@/stores/useConfigStore';
import { checkRowsSchema } from '@/utility/sanitize';

const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const followingPosts = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    return infiniteQueryOptions({
        queryKey: ['following-posts', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const queryClient = useQueryClient();
            const res = await fetch(`${apiRoot}/following-posts?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}`);
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

export function useFollowingPosts(params: Params) {
    return useInfiniteQuery(followingPosts(params));
}
