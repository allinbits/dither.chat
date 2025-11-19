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
  .post('/post-remove', ({ body }) => PostRequests.PostRemove(body), { body: Posts.PostRemoveBodySchema })
  .post('/register-handle', ({ body }) => PostRequests.RegisterHandle(body), { body: Posts.RegisterHandleBodySchema })
  .post('/transfer-handle', ({ body }) => PostRequests.TransferHandle(body), { body: Posts.TransferHandleBodySchema })
  .post('/accept-handle', ({ body }) => PostRequests.AcceptHandle(body), { body: Posts.AcceptHandleBodySchema })
  .post('/display-handle', ({ body }) => PostRequests.DisplayHandle(body), { body: Posts.DisplayHandleBodySchema })
  .post('/update-state', ({ body }) => PostRequests.UpdateState(body), {
    body: t.Object({ last_block: t.String() }),
  });
