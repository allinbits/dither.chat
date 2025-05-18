import type { Post } from 'api-main/types/feed';

import { reactive } from 'vue';

export type PopoverState = {
    like: Post | null;
    dislike: Post | null;
    flag: Post | null;
    reply: Post | null;
};

const state = reactive<PopoverState>({
    like: null,
    dislike: null,
    flag: null,
    reply: null,
});

export function usePopovers() {
    const show = (key: keyof PopoverState, post: Post) => {
        for (const key of Object.keys(state)) {
            state[key as keyof PopoverState] = null;
        }

        state[key] = post;
    };

    return {
        state,
        show,
    };
}
