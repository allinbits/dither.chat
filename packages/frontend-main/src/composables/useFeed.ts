import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';

const data = ref<Post[]>([]);

export function useFeed() {
    const offset = ref(0);
    const limit = ref(100);

    const refresh = async () => {
        const rawResponse = await fetch(`${apiRoot}/v1/feed?offset=${offset.value}&limit=${limit.value}`);
        const result = await rawResponse.json() as { status: number; rows: Post[] };
        if (!result.rows) {
            return;
        }

        data.value = result.rows;
        console.log(data.value);
    };

    if (data.value.length <= 0) {
        refresh();
    }

    return { refresh, data, offset, limit };
}
