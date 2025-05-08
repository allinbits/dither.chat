import { ref } from 'vue';

import { zodTryParse } from '@/lib/sanitize';
import { type Post, postSchema } from '@/lib/types/feed';

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
            }
            else {
                post.value = zodTryParse(postSchema, data.row[0]);
            }
        }
        catch (err) {
            console.error('Error:', err);
            error.value = String(err);
        }
    }

    return { post, error, loadPost };
}
