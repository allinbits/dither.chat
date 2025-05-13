import { t } from 'elysia';

export const DislikesQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export const FeedQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export const FlagsQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export const FollowersQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

export const FollowingQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

export const LikesQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export const PostQuery = t.Object({
    hash: t.String(),
    post_hash: t.Optional(t.String()),
});

export const PostsQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

export const RepliesQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
});
