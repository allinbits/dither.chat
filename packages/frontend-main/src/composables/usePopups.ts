import type { Post } from 'api-main/types/feed';

import { reactive } from 'vue';

export type PopupState = {
    like: Post | null;
    dislike: Post | null;
    flag: Post | null;
    reply: Post | null;
};

const state = reactive<PopupState>({
    like: null,
    dislike: null,
    flag: null,
    reply: null,
});

export function usePopups() {
    const show = (key: keyof PopupState, post: Post) => {
        for (const key of Object.keys(state)) {
            state[key as keyof PopupState] = null;
        }

        state[key] = post;
    };

    return {
        state,
        show,
    };
}
