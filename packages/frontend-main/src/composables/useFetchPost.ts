import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { postSchema } from 'api-main/types/feed';

import { checkTypeboxSchema } from '@/lib/sanitize';

const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

export function useFetchPost() {
    const post = ref<Post | null>(null);
    const error = ref('');

    async function loadPost({ hash, postHash }: { hash: string; postHash?: string }) {
        try {
            let url = `${apiRoot}/v1/post?hash=${hash}`;
            if (postHash) {
                url += `&post_hash=${postHash}`;
            }
            const rawResponse = await fetch(url);
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

            const checkedData = checkTypeboxSchema(postSchema, data.row?.[0]);
            if (checkedData) {
                post.value = checkedData;
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
