import type { Static } from 'elysia';

import { t } from 'elysia';

export const AuthBodySchema = t.Object({
  id: t.Number(),
  pub_key: t.Object({ type: t.String(), value: t.String() }),
  signature: t.String(),
});
export type AuthBody = Static<typeof AuthBodySchema>;

export const AuthCreateBodySchema = t.Object({
  address: t.String(),
});
export type AuthCreateBody = Static<typeof AuthCreateBodySchema>;

export const DislikeBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  post_hash: t.String(),
  quantity: t.String(),
  timestamp: t.String(),
});
export type DislikeBody = Static<typeof DislikeBodySchema>;

export const FlagBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  post_hash: t.String(),
  quantity: t.String(),
  timestamp: t.String(),
});
export type FlagBody = Static<typeof FlagBodySchema>;

export const FollowBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  address: t.String(),
  timestamp: t.String(),
});
export type FollowBody = Static<typeof FollowBodySchema>;

export const LikeBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  post_hash: t.String(),
  quantity: t.String(),
  timestamp: t.String(),
});
export type LikeBody = Static<typeof LikeBodySchema>;

export const ModRemovePostBodySchema = t.Object({
  hash: t.String(),
  post_hash: t.String(),
  reason: t.String(),
  timestamp: t.String(),
});
export type ModRemovePostBody = Static<typeof ModRemovePostBodySchema>;

export const ModBanBodySchema = t.Object({
  hash: t.String(),
  user_address: t.String(),
  reason: t.String(),
  timestamp: t.String(),
});
export type ModBanBody = Static<typeof ModBanBodySchema>;

export const PostBodySchema = t.Object({
  hash: t.String(),
  timestamp: t.String(),
  from: t.String(),
  msg: t.String(),
  quantity: t.String(),
});
export type PostBody = Static<typeof PostBodySchema>;

export const PostRemoveBodySchema = t.Object({
  hash: t.String(),
  post_hash: t.String(),
  from: t.String(),
  timestamp: t.String(),
});
export type PostRemoveBody = Static<typeof PostRemoveBodySchema>;

export const ReplyBodySchema = t.Object({
  hash: t.String(),
  post_hash: t.String(),
  timestamp: t.String(),
  from: t.String(),
  msg: t.String(),
  quantity: t.String(),
});
export type ReplyBody = Static<typeof ReplyBodySchema>;

export const UnfollowBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  address: t.String(),
  timestamp: t.String(),
});
export type UnfollowBody = Static<typeof UnfollowBodySchema>;

export const RegisterHandleBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  handle: t.String(),
  display: t.String(),
  timestamp: t.String(),
});
export type RegisterHandleBody = Static<typeof RegisterHandleBodySchema>;

export const DisplayHandleBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  display: t.String(),
  timestamp: t.String(),
});
export type DisplayHandleBody = Static<typeof DisplayHandleBodySchema>;

export const TransferHandleBodySchema = t.Object({
  hash: t.String(),
  handle: t.String(),
  from_address: t.String(),
  to_address: t.String(),
  timestamp: t.String(),
});
export type TransferHandleBody = Static<typeof TransferHandleBodySchema>;

export const AcceptHandleBodySchema = t.Object({
  hash: t.String(),
  from: t.String(),
  handle: t.String(),
  timestamp: t.String(),
});
export type AcceptHandleBody = Static<typeof AcceptHandleBodySchema>;

export const AddPublicKeySchema = t.Object({
  key: t.String(),
});
export type AddPublicKey = Static<typeof AddPublicKeySchema>;

export const RemovePublicKeySchema = t.Object({
  key: t.String(),
});
export type RemovePublicKey = Static<typeof RemovePublicKeySchema>;
