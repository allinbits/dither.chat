import type { Post } from 'api-main/types/feed';

import { reactive } from 'vue';

export type PopoverState = {
    like: Post | null;
    dislike: Post | null;
    flag: Post | null;
    reply: Post | null;
    post: object | null;
};

const state = reactive<PopoverState>({
    like: null,
    dislike: null,
    flag: null,
    reply: null,
    post: null,
});

export function usePopovers() {
    const show = <T extends keyof PopoverState>(key: T, val: Exclude<PopoverState[T], null>) => {
        for (const key of Object.keys(state)) {
            state[key as keyof PopoverState] = null;
        }

        state[key] = val;
    };

    return {
        state,
        show,
    };
}
