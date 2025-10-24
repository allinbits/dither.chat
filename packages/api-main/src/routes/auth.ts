import { Posts } from '@atomone/dither-api-types';
import { Elysia, t } from 'elysia';

import * as GetRequests from '../gets/index';
import * as PostRequests from '../posts/index';

/**
 * Authentication-related routes
 */
export const authRoutes = new Elysia()
  .get('/auth-verify', ({ cookie: { auth } }) => GetRequests.AuthVerify(auth))
  .post('/auth-create', ({ body, request }) => PostRequests.AuthCreate(body, request), { body: Posts.AuthCreateBody })
  .post('/auth', ({ body, cookie: { auth }, request }) => PostRequests.Auth(body, auth, request), {
    body: t.Object({
      id: t.Number(),
      pub_key: t.Object({ type: t.String(), value: t.String() }),
      signature: t.String(),
      json: t.Optional(t.Boolean()),
    }),
  })
  .post('/logout', ({ cookie: { auth } }) => PostRequests.Logout(auth));
