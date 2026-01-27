import type { Static } from 'elysia';

import { t } from 'elysia';

export const DislikesQuerySchema = t.Object({
  hash: t.String(),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  count: t.Optional(t.Boolean()),
});
export type DislikesQuery = Static<typeof DislikesQuerySchema>;

export const FeedQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  count: t.Optional(t.Boolean()),
  minQuantity: t.Optional(t.String()),
});
export type FeedQuery = Static<typeof FeedQuerySchema>;

export const FlagsQuerySchema = t.Object({
  hash: t.String(),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  count: t.Optional(t.Boolean()),
});
export type FlagsQuery = Static<typeof FlagsQuerySchema>;

export const FollowersQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  address: t.String(),
});
export type FollowersQuery = Static<typeof FollowersQuerySchema>;

export const FollowingQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  address: t.String(),
});
export type FollowingQuery = Static<typeof FollowingQuerySchema>;

export const LikesQuerySchema = t.Object({
  hash: t.String(),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  count: t.Optional(t.Boolean()),
});
export type LikesQuery = Static<typeof LikesQuerySchema>;

export const PostQuerySchema = t.Object({
  hash: t.String(),
  post_hash: t.Optional(t.String()),
});
export type PostQuery = Static<typeof PostQuerySchema>;

export const PostsQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  address: t.String(),
  minQuantity: t.Optional(t.String()),
  withReposts: t.Optional(t.Boolean()),
});
export type PostsQuery = Static<typeof PostsQuerySchema>;

export const RepliesQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  hash: t.String(),
  minQuantity: t.Optional(t.String()),
});
export type RepliesQuery = Static<typeof RepliesQuerySchema>;

export const UserRepliesQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  address: t.String(),
  minQuantity: t.Optional(t.String()),
});
export type UserRepliesQuery = Static<typeof UserRepliesQuerySchema>;

export const NotificationsQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
  address: t.String(),
});
export type NotificationsQuery = Static<typeof NotificationsQuerySchema>;

export const ReadNotificationQuerySchema = t.Object({
  address: t.String(),
  hash: t.String(),
});
export type ReadNotificationQuery = Static<typeof ReadNotificationQuerySchema>;

export const SearchQuerySchema = t.Object({
  text: t.String(),
  minQuantity: t.Optional(t.String()),
});
export type SearchQuery = Static<typeof SearchQuerySchema>;

export const IsFollowingQuerySchema = t.Object({
  follower: t.String(),
  following: t.String(),
});
export type IsFollowingQuery = Static<typeof IsFollowingQuerySchema>;

export const NotificationsCountQuerySchema = t.Object({
  address: t.String(),
});
export type NotificationsCountQuery = Static<typeof NotificationsCountQuerySchema>;
