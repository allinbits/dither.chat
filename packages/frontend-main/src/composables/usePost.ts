import type { Post } from 'api-main/types/feed';

import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { postSchema } from 'api-main/types/feed';

import { checkTypeboxSchema } from '@/utility/sanitize';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';

interface Params {
    hash: Ref<string>;
    postHash?: Ref<string | undefined>;
}

export function usePost(params: Params) {
    const query = useQuery<Post | null>({
        queryKey: computed(() => ['post', params.hash, params.postHash]),
        queryFn: async () => {
            let url = `${apiRoot}/post?hash=${params.hash.value}`;
            if (params.postHash?.value) {
                url += `&post_hash=${params.postHash.value}`;
            }

            const rawResponse = await fetch(url);
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
        retry: false,
    });

    return {
        data: query.data,
        error: query.error,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
