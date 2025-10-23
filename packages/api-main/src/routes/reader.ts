import { Posts } from '@atomone/dither-api-types';
import { Elysia, t } from 'elysia';

import * as PostRequests from '../posts/index';
import { readerAuthMiddleware } from '../middleware/readerAuth';

/**
 * Routes that require reader/indexer authorization
 * These routes use the Authorization header for authentication
 */
export const readerRoutes = new Elysia()
    .onBeforeHandle(readerAuthMiddleware)
    .post('/post', ({ body, headers }) => PostRequests.Post(body, headers), { body: Posts.PostBody })
    .post('/reply', ({ body, headers }) => PostRequests.Reply(body, headers), { body: Posts.ReplyBody })
    .post('/follow', ({ body, headers }) => PostRequests.Follow(body, headers), { body: Posts.FollowBody })
    .post('/unfollow', ({ body, headers }) => PostRequests.Unfollow(body, headers), { body: Posts.UnfollowBody })
    .post('/like', ({ body, headers }) => PostRequests.Like(body, headers), { body: Posts.LikeBody })
    .post('/dislike', ({ body, headers }) => PostRequests.Dislike(body, headers), { body: Posts.DislikeBody })
    .post('/flag', ({ body, headers }) => PostRequests.Flag(body, headers), { body: Posts.FlagBody })
    .post('/post-remove', ({ body, headers }) => PostRequests.PostRemove(body, headers), { body: Posts.PostRemoveBody })
    .post('/update-state', ({ body, headers }) => PostRequests.UpdateState(body, headers), {
        body: t.Object({ last_block: t.String() }),
    });
