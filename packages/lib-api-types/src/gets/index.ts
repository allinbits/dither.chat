import { t } from 'elysia';

export type DislikesQuery = { hash: string; limit?: number; offset?: number; count?: boolean };
export const DislikesQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export type FeedQuery = { limit?: number; offset?: number; count?: boolean };
export const FeedQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export type FlagsQuery = { hash: string; limit?: number; offset?: number; count?: boolean };
export const FlagsQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export type FollowersQuery = { limit?: number; offset?: number; address: string };
export const FollowersQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

export type FollowingQuery = { limit?: number; offset?: number; address: string };
export const FollowingQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

export type LikesQuery = { hash: string; limit?: number; offset?: number; count?: boolean };
export const LikesQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export type PostQuery = { hash: string; post_hash?: string };
export const PostQuery = t.Object({
    hash: t.String(),
    post_hash: t.Optional(t.String()),
});

export type PostsQuery = { limit?: number; offset?: number; address: string };
export const PostsQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

export type RepliesQuery = { limit?: string; offset?: string; hash: string };
export const RepliesQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
});

export type NotificationsQuery = { limit?: string; offset?: string };
export const NotificationsQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
});

export type ReadNotificationQuery = { address: string; hash: string };
export const ReadNotificationQuery = t.Object({
    address: t.String(),
    hash: t.String(),
});