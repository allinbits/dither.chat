import { type Ref } from 'vue';
import { queryOptions, useQuery } from '@tanstack/vue-query';
import { type Post, postSchema } from 'api-main/types/feed';

import { useConfigStore } from '@/stores/useConfigStore';
import { checkRowsSchema } from '@/utility/sanitize';

interface Params {
    hash: Ref<string>;
}

export const post = (params: Params) => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    return queryOptions({
        queryKey: ['post', params.hash],
        queryFn: async () => {
            const rawResponse = await fetch(`${apiRoot}/post?hash=${params.hash.value}`);
            if (!rawResponse.ok) {
                throw new Error('Failed to fetch post');
            }

            const result = await rawResponse.json();
            if (result.status === 404 || !result.rows?.length) {
                throw new Error('Post not found');
            }

            const row = result.rows[0];
            if (row?.timestamp) {
                row.timestamp = new Date(row.timestamp);
            }

            const checkedRows: Post[] = checkRowsSchema(postSchema, [row]);
            if (!checkedRows.length) {
                throw new Error('Invalid post format');
            }

            return checkedRows[0];
        },
        enabled: () => !!params.hash.value,
        staleTime: Infinity,
    });
};

export function usePost(params: Params) {
    return useQuery(post(params));
}
