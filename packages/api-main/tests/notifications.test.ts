import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { createWallet, get, getRandomHash, post, userLogin } from './shared';

describe('v1/notifications', async () => {
  const walletA = await createWallet();
  const walletB = await createWallet();

  let bearerToken: string;

  it('user obtains bearer token', async () => {
    bearerToken = await userLogin(walletB);
    assert.isOk(bearerToken.length >= 1, 'bearer was not passed back');
  });

  // Follows
  it('pOST - /follow', async () => {
    const body: typeof Posts.FollowBody.static = {
      from: walletA.publicKey,
      hash: getRandomHash(),
      address: walletB.publicKey,
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`follow`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
    const notificationResponse = await get<{
      status: number;
      rows: {
        hash: string;
        owner: string;
        type: 'like' | 'dislike' | 'flag' | 'follow' | 'reply';
        timestamp: Date | null;
        was_read: boolean | null;
        actor: string;
      }[];
    }>(`notifications?address=${walletB.publicKey}`, bearerToken);
    // Asert user got a notification and can read it
    assert.isOk(notificationResponse?.status === 200, `response was not okay, got ${notificationResponse?.status}`);
    assert.lengthOf(notificationResponse.rows, 1);
    assert.isFalse(notificationResponse.rows[0].was_read, `notification was not marked as read, got true`);
    assert.isOk(notificationResponse.rows[0].actor === walletA.publicKey, `unexpected actor, got ${notificationResponse.rows[0].actor}`);

    const readResponse = await post<{
      status: number;
    }>(
      `notification-read?address=${walletB.publicKey}&hash=${notificationResponse.rows[0].hash}`,
      {},
      bearerToken,
    );
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    // after reading the notification it should no longer show
    const lastResponse = await get<{
      status: number;
      rows: {
        hash: string;
        owner: string;
        type: 'like' | 'dislike' | 'flag' | 'follow' | 'reply';
        timestamp: Date | null;
        was_read: boolean | null;
      }[];
    }>(`notifications?address=${walletB.publicKey}`, bearerToken);

    assert.isOk(lastResponse?.rows.findIndex(x => x.hash === notificationResponse.rows[0].hash) === -1, 'notification was still available in array');
  });

  // Follows
  it('liking a post notify the post owner', async () => {
    const genericPostMessage
      = 'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';
    const postHash = getRandomHash();
    const body: typeof Posts.PostBody.static = {
      from: walletA.publicKey,
      hash: postHash,
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const postResponse = await post(`post`, body);
    assert.isOk(postResponse != null);
    assert.isOk(postResponse && postResponse.status === 200, 'response was not okay');

    const likeBody: typeof Posts.LikeBody.static = {
      from: walletB.publicKey,
      hash: getRandomHash(),
      post_hash: postHash,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const likeResponse = await post(`like`, likeBody);
    assert.isOk(likeResponse != null);
    assert.isOk(likeResponse && likeResponse.status === 200, `response was not okay got ${likeResponse.status}`);

    // Login as userA
    bearerToken = await userLogin(walletA);
    assert.isOk(bearerToken.length >= 1, 'bearer was not passed back');

    const notificationCount = await get<{
      status: number;
      count: number;
    }>(`notifications-count?address=${walletA.publicKey}`, bearerToken);
    assert.isOk(notificationCount?.count === 1, 'notification count was not at least one');

    const notificationResponse = await get<{
      status: number;
      rows: {
        hash: string;
        owner: string;
        type: 'like' | 'dislike' | 'flag' | 'follow' | 'reply';
        timestamp: Date | null;
        was_read: boolean | null;
        actor: string;
      }[];
    }>(`notifications?address=${walletA.publicKey}`, bearerToken);
    // Asert user got a notification and can read it
    assert.isOk(notificationResponse?.status === 200, `response was not okay, got ${notificationResponse?.status}`);
    assert.lengthOf(notificationResponse.rows, 1);
    assert.isFalse(notificationResponse.rows[0].was_read, `notification was not marked as read, got true`);
    assert.isOk(notificationResponse.rows[0].actor === walletB.publicKey, `unexpected actor, got ${notificationResponse.rows[0].actor}`);

    const readResponse = await post<{
      status: number;
    }>(
      `notification-read?address=${walletA.publicKey}&hash=${notificationResponse.rows[0].hash}`,
      {},
      bearerToken,
    );
    assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
    // after reading the notification it should be marked as read
    const lastResponse = await get<{
      status: number;
      rows: {
        hash: string;
        owner: string;
        type: 'like' | 'dislike' | 'flag' | 'follow' | 'reply';
        timestamp: Date | null;
        was_read: boolean | null;
      }[];
    }>(`notifications?address=${walletA.publicKey}`, bearerToken);

    assert.isOk(lastResponse?.rows.findIndex(x => x.hash === notificationResponse.rows[0].hash) === -1, 'notification was still available in array');
  });
});
