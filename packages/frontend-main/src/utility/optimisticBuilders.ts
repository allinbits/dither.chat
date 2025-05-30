import type { InfiniteData } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';

interface BuildNewPostParams {
    message: string; hash: string; postHash: string | null; author: string; quantity: number;
}
export const buildNewPost = ({ message, hash, postHash, author, quantity }: BuildNewPostParams): Post => ({
    hash: hash.toLowerCase(),
    post_hash: postHash ? postHash.toLocaleLowerCase() : null,
    author,
    timestamp: new Date(),
    message,
    quantity,
    replies: 0,
    likes: 0,
    dislikes: 0,
    flags: null,
    likes_burnt: null,
    dislikes_burnt: null,
    flags_burnt: null,
    removed_hash: null,
    removed_at: null,
    removed_by: null,
});

interface BuildNewInfiniteDataParams<T> {
    previousItems: InfiniteData<T[], unknown> | undefined;
    newItem: T;
}
export function buildNewInfiniteData<T>({ previousItems, newItem }: BuildNewInfiniteDataParams<T>) {
    const newPages = previousItems?.pages ? [...previousItems.pages] : [];
    if (newPages.length > 0) {
        newPages[0] = [newItem, ...newPages[0]];
    }
    else {
        newPages.push([newItem]);
    }
    const newData: InfiniteData<T[], unknown> = {
        pages: newPages,
        pageParams: previousItems?.pageParams ?? [0],
    };
    return newData;
}
