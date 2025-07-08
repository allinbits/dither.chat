import type { InfiniteData } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';
import type { Following } from 'api-main/types/follows';

interface NewPostParams {
    message: string; hash: string; postHash: string | null; author: string; quantity: string;
}

interface NewFollowingParams {
    address: string;
}

// Returns a new Post, used for display
export const newPost = ({ message, hash, postHash, author, quantity }: NewPostParams): Post => ({
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

// Returns a new Following, used for display
export const newFollowing = ({ address }: NewFollowingParams): Following => ({
    address,
    hash: '',
});

interface InfiniteDataWithNewItemParams<T> {
    previousItems: InfiniteData<T[], unknown> | undefined;
    newItem: T;
}
// Returns an InfiniteData with pages and pageParams after adding a new item to previous items, used for display
export function infiniteDataWithNewItem<T>({ previousItems, newItem }: InfiniteDataWithNewItemParams<T>) {
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

interface InfiniteDataWitoutItemParams<T> {
    previousItems: InfiniteData<T[], unknown> | undefined;
    predicate: (item: T) => boolean;
}
// Returns an InfiniteData with pages and pageParams after removing an item, used for display
export function infiniteDataWithoutItem<T>({ previousItems, predicate }: InfiniteDataWitoutItemParams<T>) {
    let newPages = previousItems?.pages ? [...previousItems.pages] : [];
    newPages = newPages.map(page => page.filter(item => !predicate(item))) ?? [];

    return {
        pages: newPages,
        pageParams: previousItems?.pageParams ?? [0],
    };
}
