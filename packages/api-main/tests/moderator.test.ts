import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { getDatabase } from '../drizzle/db';
import { ModeratorTable } from '../drizzle/schema';
import { createWallet, get, getAtomOneAddress, getRandomHash, post, signADR36Document } from './shared';

describe('v1 - mod', { sequential: true }, () => {
  const addressUserA = getAtomOneAddress();
  let addressModerator = getAtomOneAddress();
  const genericPostMessage
    = 'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';
  const postHash = getRandomHash();
  const secondPostHash = getRandomHash();
  let bearerToken: string;

  it('pOST mod obtain bearer token', async () => {
    const walletA = await createWallet();
    addressModerator = walletA.publicKey;
    const body: typeof Posts.AuthCreateBody.static = {
      address: walletA.publicKey,
    };

    const response = (await post(`auth-create`, body)) as { status: 200; id: number; message: string };
    assert.isOk(response?.status === 200, 'response was not okay');

    const signData = await signADR36Document(walletA.mnemonic, response.message);
    const verifyBody: typeof Posts.AuthBody.static & { json?: boolean } = {
      id: response.id,
      ...signData.signature,
      json: true,
    };

    const responseVerify = (await post(`auth`, verifyBody)) as { status: 200; bearer: string };
    assert.isOk(responseVerify?.status === 200, 'response was not verified and confirmed okay');
    assert.isOk(responseVerify.bearer.length >= 1, 'bearer was not passed back');
    bearerToken = responseVerify.bearer;
  });

  it('pOST - /post', async () => {
    const body: typeof Posts.PostBody.static = {
      from: addressUserA,
      hash: postHash,
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`post`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
  });

  it('pOST - /mod/post-remove without autorization', async () => {
    const body: typeof Posts.ModRemovePostBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: postHash,
      reason: 'spam',
    };

    const replyResponse = await post(`mod/post-remove`, body);
    assert.isOk(replyResponse?.status === 401, `expected unauthorized, got ${JSON.stringify(replyResponse)}`);
  });

  it('pOST - /mod/post-remove moderator does not exists', async () => {
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `posts?address=${addressUserA}`,
    );
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

    const body: typeof Posts.ModRemovePostBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: response.rows[0].hash,
      reason: 'spam',
    };

    const replyResponse = await post(`mod/post-remove`, body, bearerToken);
    assert.isOk(replyResponse?.status === 404, `expected moderator was not found`);

    const postsResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`posts?address=${addressUserA}`);

    assert.isOk(postsResponse?.status === 200, 'posts did not resolve');
    const data = postsResponse?.rows.find(x => x.hash === response.rows[0].hash);
    assert.isOk(data, 'data was hidden');
  });

  it('pOST - /mod/post-remove moderator exists', async () => {
    await getDatabase()
      .insert(ModeratorTable)
      .values({
        address: addressModerator,
        alias: 'mod',
      })
      .execute();
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `posts?address=${addressUserA}`,
    );
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

    const body: typeof Posts.ModRemovePostBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: response.rows[0].hash,
      reason: 'spam',
    };

    const replyResponse = await post(`mod/post-remove`, body, bearerToken);
    assert.isOk(replyResponse?.status === 200, `response was not okay, got ${JSON.stringify(replyResponse)}`);

    const postsResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`posts?address=${addressUserA}`);

    assert.isOk(postsResponse?.status === 200, 'posts did not resolve');
    const data = postsResponse?.rows.find(x => x.hash === response.rows[0].hash);
    assert.isUndefined(data, 'data was not hidden');
  });

  it('pOST - /mod/post-restore', async () => {
    const body: typeof Posts.ModRemovePostBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: postHash,
      reason: 'spam',
    };

    const replyResponse = await post(`mod/post-restore`, body, bearerToken);
    assert.isOk(replyResponse?.status === 200, `response was not okay, got ${JSON.stringify(replyResponse)}`);

    const postsResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`posts?address=${addressUserA}`);

    assert.isOk(postsResponse?.status === 200, 'posts did not resolve');
    const data = postsResponse?.rows.find(x => x.hash === postHash);
    assert.isOk(data, 'data is hidden');
  });

  it('pOST - /mod/post-restore on an user deleted post', async () => {
    // USER REMOVES POST
    const body: typeof Posts.PostRemoveBody.static = {
      from: addressUserA,
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: postHash,
    };

    const userRemoveResponse = await post(`post-remove`, body, bearerToken);
    assert.isOk(userRemoveResponse?.status === 200, 'response was not okay');

    // MOD tries to restore post
    const bodymod: typeof Posts.ModRemovePostBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: postHash,
      reason: 'spam',
    };

    const replyResponse = await post(`mod/post-restore`, bodymod);
    assert.isOk(replyResponse?.status === 401, `response was not okay, expected unauthorized`);
  });

  it('pOST - /post user creates a second post', async () => {
    const body: typeof Posts.PostBody.static = {
      from: addressUserA,
      hash: secondPostHash,
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`post`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
  });

  it('pOST - /mod/ban user banned deletes posts', async () => {
    // moderator bans user
    const body: typeof Posts.ModBanBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      user_address: addressUserA,
      reason: 'user too political',
    };

    const userBanResponse = await post(`mod/ban`, body, bearerToken);
    assert.isOk(userBanResponse?.status === 200, `response was not okay ${JSON.stringify(userBanResponse)}`);

    // post from user should be all hidden
    const postsResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`posts?address=${addressUserA}`);

    assert.isOk(postsResponse?.status === 200, 'posts did not resolve');
    assert.isOk(
      Array.isArray(postsResponse.rows) && postsResponse.rows.length === 0,
      'some of the user posts are shown',
    );
  });

  it('pOST - banned user publishes post is deleted automatically', async () => {
    const body: typeof Posts.PostBody.static = {
      from: addressUserA,
      hash: getRandomHash(),
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`post`, body, bearerToken);
    assert.isOk(response?.status === 200, 'response was not okay');

    // Even new post should be hidden
    const postsResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`posts?address=${addressUserA}`);

    assert.isOk(postsResponse?.status === 200, 'posts did not resolve');
    assert.isOk(
      Array.isArray(postsResponse.rows) && postsResponse.rows.length === 0,
      'some of the user posts are shown',
    );
  });

  it('pOST - unban restore all posts but user deleted ones', async () => {
    const body: typeof Posts.ModBanBody.static = {
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      user_address: addressUserA,
      reason: 'user too political',
    };

    const userBanResponse = await post(`mod/unban`, body, bearerToken);
    assert.isOk(userBanResponse?.status === 200, `response was not okay ${JSON.stringify(userBanResponse)}`);
  });

  it('pOST - freshly unbanned user publishes without problems', async () => {
    const newPostHash = getRandomHash();
    const body: typeof Posts.PostBody.static = {
      from: addressUserA,
      hash: newPostHash,
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`post`, body, bearerToken);
    assert.isOk(response?.status === 200, 'response was not okay');

    // Even new post should be hidden
    const postsResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`posts?address=${addressUserA}`);

    assert.isOk(postsResponse?.status === 200, 'posts did not resolve');
    const data = postsResponse?.rows.find(x => x.hash === newPostHash);
    assert.isOk(data, 'New post was hidden');
  });
});
