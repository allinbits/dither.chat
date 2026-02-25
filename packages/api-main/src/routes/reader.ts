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
  .post('/post', ({ body }) => PostRequests.Post(body), { body: Posts.PostBodySchema })
  .post('/reply', ({ body }) => PostRequests.Reply(body), { body: Posts.ReplyBodySchema })
  .post('/follow', ({ body }) => PostRequests.Follow(body), { body: Posts.FollowBodySchema })
  .post('/unfollow', ({ body }) => PostRequests.Unfollow(body), { body: Posts.UnfollowBodySchema })
  .post('/like', ({ body }) => PostRequests.Like(body), { body: Posts.LikeBodySchema })
  .post('/dislike', ({ body }) => PostRequests.Dislike(body), { body: Posts.DislikeBodySchema })
  .post('/flag', ({ body }) => PostRequests.Flag(body), { body: Posts.FlagBodySchema })
  .post('/repost', ({ body }) => PostRequests.Repost(body), { body: Posts.RepostBodySchema })
  .post('/post-remove', ({ body }) => PostRequests.PostRemove(body), { body: Posts.PostRemoveBodySchema })
  .post('/update-state', ({ body }) => PostRequests.UpdateState(body), {
    body: t.Object({ last_block: t.String() }),
  });
