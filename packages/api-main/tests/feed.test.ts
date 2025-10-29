import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { createWallet, get, getRandomHash, post } from './shared';

describe('filter post depending on send tokens', async () => {
  const walletB = await createWallet();
  const cheapPostMessage = 'cheap post';
  const expensivePostMessage = 'expensive post';
  const expensivePostTokens = '20';

  it('user creates one cheap and one expensive posts', async () => {
    const body: Posts.PostBody = {
      from: walletB.publicKey,
      hash: getRandomHash(),
      msg: cheapPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    let postResponse = await post(`post`, body);

    const expensiveBody: Posts.PostBody = {
      from: walletB.publicKey,
      hash: getRandomHash(),
      msg: expensivePostMessage,
      quantity: expensivePostTokens,
      timestamp: '2025-04-16T19:46:42Z',
    };

    postResponse = await post(`post`, expensiveBody);
    assert.isOk(postResponse != null);
    assert.isOk(postResponse && postResponse.status === 200, 'response was not okay');
  });

  it('get feed without filtering by tokens', async () => {
    const readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`feed`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.isOk(readResponse.rows.length >= 2);
  });

  it('filtering expensive posts', async () => {
    const readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`feed?minQuantity=${expensivePostTokens}`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.lengthOf(readResponse.rows, 1);
  });

  it('search: filtering cheap posts', async () => {
    let readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`search?text="${cheapPostMessage}"&minQuantity=1`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.lengthOf(readResponse.rows, 1);

    readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`search?text="${cheapPostMessage}"&minQuantity=${expensivePostTokens}`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.lengthOf(readResponse.rows, 0);
  });
});

describe('user replies with parent', async () => {
  const walletA = await createWallet();
  const walletB = await createWallet();
  const parentPost = getRandomHash();
  const replyPost = getRandomHash();
  const postMessage = 'this is a post';
  const replyMessage = 'this is a reply';

  it('pOST - /post', async () => {
    const body: Posts.PostBody = {
      from: walletA.publicKey,
      hash: parentPost,
      msg: postMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`post`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
  });

  it('pOST - /reply', async () => {
    const body: Posts.ReplyBody = {
      from: walletB.publicKey,
      hash: replyPost,
      post_hash: parentPost,
      msg: replyMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const replyResponse = await post(`reply`, body);
    assert.isOk(replyResponse?.status === 200, 'response was not okay');
  });

  it('get user replies', async () => {
    const userRepliesResponse = await get<{
      status: number;
      rows: {
        parent: { hash: string; author: string; message: string };
        reply: { hash: string; author: string; message: string };
      }[];
    }>(`user-replies?address=${walletB.publicKey}`);
    assert.isOk(userRepliesResponse?.status === 200, `response was not okay, got ${userRepliesResponse?.status}`);
    assert.isOk(userRepliesResponse.rows.length >= 1);
    assert.equal(userRepliesResponse.rows[0].reply.hash, replyPost);
    assert.equal(userRepliesResponse.rows[0].parent.hash, parentPost);
    assert.equal(userRepliesResponse.rows[0].reply.message, replyMessage);
    assert.equal(userRepliesResponse.rows[0].parent.message, postMessage);
  });
});

describe('get post from followed', async () => {
  const walletA = await createWallet();
  const walletB = await createWallet();
  const postMessage = 'this is a post';

  it('zero posts if not followers', async () => {
    const readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
        quantity: string;
      }[];
    }>(`following-posts?address=${walletA.publicKey}`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.lengthOf(readResponse.rows, 0);
  });

  it('pOST - now followed user posts', async () => {
    const body: Posts.PostBody = {
      from: walletB.publicKey,
      hash: getRandomHash(),
      msg: postMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const postResponse = await post(`post`, body);
    assert.isOk(postResponse != null);
    assert.isOk(postResponse && postResponse.status === 200, 'response was not okay');
  });

  it('still empty response', async () => {
    const readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
      }[];
    }>(`following-posts?address=${walletA.publicKey}`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.lengthOf(readResponse.rows, 0);
  });

  it('one post when user follows', async () => {
    const body: Posts.FollowBody = {
      from: walletA.publicKey,
      hash: getRandomHash(),
      address: walletB.publicKey,
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`follow`, body);
    assert.isOk(response?.status === 200, 'unable to follow user');

    const readResponse = await get<{
      status: number;
      rows: {
        hash: string;
        author: string;
        message: string;
        deleted_at: Date;
        deleted_reason: string;
        deleted_hash: string;
        quantity: string;
      }[];
    }>(`following-posts?address=${walletA.publicKey}`);
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    assert.lengthOf(readResponse.rows, 1);
    assert.isOk(readResponse.rows[0].author, 'Author was not included');
    assert.isOk(readResponse.rows[0].message, 'message was not included');
    assert.isOk(readResponse.rows[0].quantity, 'quantity was not included');
  });
});
