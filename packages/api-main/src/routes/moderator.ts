import { Posts } from '@atomone/dither-api-types';
import { Elysia } from 'elysia';

import * as PostRequests from '../posts/index';

/**
 * Moderator routes that require JWT cookie authentication
 * These routes are prefixed with /mod
 */
export const moderatorRoutes = new Elysia({ prefix: '/mod' })
  .post('/post-remove', ({ body, cookie: { auth } }) => PostRequests.ModRemovePost(body, auth), {
    body: Posts.ModRemovePostBody,
  })
  .post('/post-restore', ({ body, cookie: { auth } }) => PostRequests.ModRestorePost(body, auth), {
    body: Posts.ModRemovePostBody,
  })
  .post('/ban', ({ body, cookie: { auth } }) => PostRequests.ModBan(body, auth), {
    body: Posts.ModBanBody,
  })
  .post('/unban', ({ body, cookie: { auth } }) => PostRequests.ModUnban(body, auth), {
    body: Posts.ModBanBody,
  });
