import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { postSchema } from 'api-main/types/feed';

import { validateOrNull } from '@/lib/sanitize';

const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

export function useFetchPost() {
    const post = ref<Post | null>(null);
    const error = ref('');

    async function loadPost(id: number) {
        try {
            const rawResponse = await fetch(`${apiRoot}/v1/post/${id}`);
            const data = await rawResponse.json();

            if (rawResponse.status !== 200) {
                console.error('Error:', rawResponse);
                error.value = 'Failed to fetch post';
                return;
            }
            const postData = data.row?.[0];

            if (postData?.timestamp) {
                postData.timestamp = new Date(postData.timestamp);
            }

            const parsed = validateOrNull(postSchema, data.row?.[0]);
            if (parsed) {
                post.value = parsed;
            }
            else {
                error.value = 'Invalid post format';
            }
        }
        catch (err) {
            console.error('Error:', err);
            error.value = String(err);
        }
    }

    return { post, error, loadPost };
}
