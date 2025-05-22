import type { Post } from 'api-main/types/feed';

import { reactive } from 'vue';

export type PopupState = {
    like: Post | null;
    dislike: Post | null;
    flag: Post | null;
    reply: Post | null;
    newPost: object | null;
    follow: string | null;
    unfollow: string | null;
};

const state = reactive<PopupState>({
    like: null,
    dislike: null,
    flag: null,
    reply: null,
    newPost: null,
    follow: null,
    unfollow: null,
});

export function usePopups() {
    const show = <T extends keyof PopupState>(key: T, val: Exclude<PopupState[T], null>) => {
        for (const key of Object.keys(state)) {
            state[key as keyof PopupState] = null;
        }

        state[key] = val;
    };

    return {
        state,
        show,
    };
}
