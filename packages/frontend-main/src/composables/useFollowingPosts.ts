import type { Post } from 'api-main/types/feed';

import { type Ref, ref } from 'vue';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';

import { post } from './usePost';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const LIMIT = 15;

interface Params {
    userAddress: Ref<string>;
}

export const followingPosts = (params: Params) => {
    const queryClient = useQueryClient();
    return infiniteQueryOptions({
        queryKey: ['following-posts', params.userAddress],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`${apiRoot}/following-posts?address=${params.userAddress.value}&offset=${pageParam}&limit=${LIMIT}`);
            const json = await res.json() as { status: number; rows: Post[] };
            const rows = json.rows ?? [];

            // We update one post when doing an action like/dislike/reply in PostItem, RepliesGroupItem PostReplyItem
            // We prevent fetching post many times by populating the fetched following posts into each post
            rows.forEach((row) => {
                const postOpts = post({ hash: ref(row.hash) });
                queryClient.setQueryData(postOpts.queryKey, row);
            });

            return rows;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < LIMIT) return undefined;
            return allPages.length * LIMIT;
        },
        enabled: () => !!params.userAddress.value,
        retry: false,
        staleTime: Infinity,
    });
};

export function useFollowingPosts(params: Params) {
    return useInfiniteQuery(followingPosts(params));
}
