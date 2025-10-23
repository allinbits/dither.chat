import { Posts } from '@atomone/dither-api-types';
import { Elysia, t } from 'elysia';

import { readerAuthMiddleware } from '../middleware/readerAuth';
import * as PostRequests from '../posts/index';

/**
 * Routes that require reader/indexer authorization
 * These routes use the Authorization header for authentication
 */
export const readerRoutes = new Elysia()
    .onBeforeHandle(readerAuthMiddleware)
    .post('/post', ({ body }) => PostRequests.Post(body), { body: Posts.PostBody })
    .post('/reply', ({ body }) => PostRequests.Reply(body), { body: Posts.ReplyBody })
    .post('/follow', ({ body }) => PostRequests.Follow(body), { body: Posts.FollowBody })
    .post('/unfollow', ({ body }) => PostRequests.Unfollow(body), { body: Posts.UnfollowBody })
    .post('/like', ({ body }) => PostRequests.Like(body), { body: Posts.LikeBody })
    .post('/dislike', ({ body }) => PostRequests.Dislike(body), { body: Posts.DislikeBody })
    .post('/flag', ({ body }) => PostRequests.Flag(body), { body: Posts.FlagBody })
    .post('/post-remove', ({ body }) => PostRequests.PostRemove(body), { body: Posts.PostRemoveBody })
    .post('/update-state', ({ body }) => PostRequests.UpdateState(body), {
        body: t.Object({ last_block: t.String() }),
    });
