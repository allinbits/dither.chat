import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';

const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

// FIXME: This is a temporary function to search for posts.
// It will be replaced with a more efficient search function in the future.
export function useSearchPosts() {
    const data = ref<Post[]>([]);

    const searchPosts = async (keyword: string) => {
        const rawResponse = await fetch(`${apiRoot}/feed?offset=0&limit=20`);
        const result = (await rawResponse.json()) as { status: number; rows: Post[] };
        if (!result.rows) {
            return;
        }

        data.value = result.rows;
    };

    return { searchPosts, data };
}
