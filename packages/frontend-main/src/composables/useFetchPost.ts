import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { postSchema } from 'api-main/types/feed';

import { checkTypeboxSchema } from '@/utility/sanitize';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';

export function useFetchPost() {
    const data = ref<Post | null>(null);
    const error = ref('');

    async function loadPost({ hash, postHash }: { hash: string; postHash?: string }) {
        try {
            let url = `${apiRoot}/post?hash=${hash}`;
            if (postHash) {
                url += `&post_hash=${postHash}`;
            }
            const rawResponse = await fetch(url);
            if (rawResponse.status !== 200) {
                console.error('Error:', rawResponse);
                error.value = 'Failed to fetch post';
                return;
            }

            const result = await rawResponse.json();
            if (result.status === 404 || !result.rows?.length) {
                console.error('Error:', result.status);
                error.value = 'Post not found';
                return;
            }
            const postData = result.rows[0];

            if (postData?.timestamp) {
                postData.timestamp = new Date(postData.timestamp);
            }

            const checkedData = checkTypeboxSchema(postSchema, postData);
            if (checkedData) {
                data.value = checkedData;
            }
            else {
                error.value = 'Invalid post format';
            }
        }
        catch (err) {
            console.log('errerrerr', err);
            console.error('Error:', err);
            error.value = String(err);
        }
    }

    return { data, error, loadPost };
}
