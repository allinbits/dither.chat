import { type Ref } from 'vue';
import { queryOptions, useQuery } from '@tanstack/vue-query';
import { postSchema } from 'api-main/types/feed';

import { checkTypeboxSchema } from '@/utility/sanitize';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';

interface Params {
    hash: Ref<string>;
}

export const post = (params: Params) =>
    queryOptions({
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

            const postData = result.rows[0];
            if (postData?.timestamp) {
                postData.timestamp = new Date(postData.timestamp);
            }

            const checkedData = checkTypeboxSchema(postSchema, postData);
            if (!checkedData) {
                throw new Error('Invalid post format');
            }

            return checkedData;
        },
        enabled: () => !!params.hash.value,
        staleTime: Infinity,
    });

export function usePost(params: Params) {
    return useQuery(post(params));
}
