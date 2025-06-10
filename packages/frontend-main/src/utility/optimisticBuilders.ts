import type { InfiniteData } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';

interface NewPostParams {
    message: string; hash: string; postHash: string | null; author: string; quantity: number;
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

interface InfiniteDataWithUpdatedPostParams {
    previousPosts: InfiniteData<Post[], unknown> | undefined;
    updatedPost: Post;
}
// Returns an InfiniteData with pages and pageParams after updating a Post, used for display
export function infiniteDataWithUpdatedPost({ previousPosts, updatedPost }: InfiniteDataWithUpdatedPostParams) {
    const pages = previousPosts?.pages.map(page =>
        page.map(post =>
            post.hash === updatedPost.hash
                ? updatedPost
                : post,
        ),
    ) || [];
    const postsData: InfiniteData<Post[]> = {
        pageParams: previousPosts?.pageParams || [],
        pages,
    };
    return postsData;
}
