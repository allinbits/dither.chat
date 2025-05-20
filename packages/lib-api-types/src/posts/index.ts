import { t } from 'elysia';

// As a side note the following is required with sinclair typebox limitations:
// 1. We must specify a static type.
// 2. Static types cannot be defined and then transpiled for type definitions.
// 3. Both are required to allow for cross-compat across all packages.

export type AuthBody = { id: number; pub_key: { type: string; value: string }; signature: string };
export const AuthBody = t.Object({
    id: t.Number(),
    pub_key: t.Object({ type: t.String(), value: t.String() }),
    signature: t.String(),
});

export type AuthCreateBody = { address: string };
export const AuthCreateBody = t.Object({
    address: t.String(),
});

export type DislikeBody = { hash: string; from: string; post_hash: string; quantity: string; timestamp: string };
export const DislikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    post_hash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

export type FlagBody = { hash: string; from: string; post_hash: string; quantity: string; timestamp: string };
export const FlagBody = t.Object({
    hash: t.String(),
    from: t.String(),
    post_hash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

export type FollowBody = { hash: string; from: string; address: string; timestamp: string };
export const FollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
    timestamp: t.String(),
});

export type LikeBody = { hash: string; from: string; post_hash: string; quantity: string; timestamp: string };
export const LikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    post_hash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

export type ModRemovePostBody = {
    hash: string;
    post_hash: string;
    reason: string;
    timestamp: string;
};
export const ModRemovePostBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
    reason: t.String(),
    timestamp: t.String(),
});

export type ModBanBody = {
    hash: string;
    user_address: string;
    reason: string;
    timestamp: string;
};
export const ModBanBody = t.Object({
    hash: t.String(),
    user_address: t.String(),
    reason: t.String(),
    timestamp: t.String(),
});

export type PostBody = { hash: string; timestamp: string; from: string; msg: string; quantity: string };
export const PostBody = t.Object({
    hash: t.String(),
    timestamp: t.String(),
    from: t.String(),
    msg: t.String(),
    quantity: t.String(),
});

export type PostRemoveBody = { hash: string; post_hash: string; from: string; timestamp: string };
export const PostRemoveBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
    from: t.String(),
    timestamp: t.String(),
});

export type ReplyBody = { hash: string; post_hash: string; timestamp: string; from: string; msg: string; quantity: string };
export const ReplyBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
    timestamp: t.String(),
    from: t.String(),
    msg: t.String(),
    quantity: t.String(),
});

export type UnfollowBody = { hash: string; from: string; address: string; timestamp: string };
export const UnfollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
    timestamp: t.String(),
});