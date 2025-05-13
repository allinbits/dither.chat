import { t } from 'elysia';

export const AuthBody = t.Object({
    id: t.Number(),
    pub_key: t.Object({ type: t.String(), value: t.String() }),
    signature: t.String(),
});

export const AuthCreateBody = t.Object({
    address: t.String(),
});

export const DislikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    post_hash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

export const FlagBody = t.Object({
    hash: t.String(),
    from: t.String(),
    post_hash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

export const FollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
    timestamp: t.String(),
});

export const LikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    post_hash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

export const ModRemovePostBody = t.Object({
    hash: t.String(),
    mod_address: t.String(),
    post_hash: t.String(),
    reason: t.String(),
    timestamp: t.String(),
});

export const ModBanBody = t.Object({
    hash: t.String(),
    mod_address: t.String(),
    user_address: t.String(),
    reason: t.String(),
    timestamp: t.String(),
});

export const PostBody = t.Object({
    hash: t.String(),
    timestamp: t.String(),
    from: t.String(),
    msg: t.String(),
    quantity: t.String(),
});

export const PostRemoveBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
    from: t.String(),
    timestamp: t.String(),
});

export const ReplyBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
    timestamp: t.String(),
    from: t.String(),
    msg: t.String(),
    quantity: t.String(),
});

export const UnfollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
    timestamp: t.String(),
});
