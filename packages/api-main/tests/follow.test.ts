import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { get, getAtomOneAddress, getRandomHash, post } from './shared';

describe('follows', async () => {
  const addressUserA = getAtomOneAddress();
  const addressUserB = getAtomOneAddress();
  const addressUserC = getAtomOneAddress();

  // Follows
  it('pOST - /follow', async () => {
    const body: Posts.FollowBody = {
      from: addressUserA,
      hash: getRandomHash(),
      address: addressUserB,
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`follow`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
  });

  it('gET - /is-following', async () => {
    let response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `is-following?follower=${addressUserA}&following=${addressUserB}`,
    );

    assert.isOk(response?.status === 200, 'follower was not found, should have follower');
    response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `is-following?follower=${addressUserA}&following=${addressUserC}`,
    );

    assert.isOk(response?.status === 404, 'follower was found when follower should not be following anyone');
  });

  it('pOST - /follow - no duplicates', async () => {
    const body: Posts.FollowBody = {
      hash: getRandomHash(),
      from: addressUserA,
      address: addressUserB,
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`follow`, body, 'WRITE');
    assert.isOk(response?.status === 400, 'additional follow was allowed somehow');
  });

  it('gET - /following', async () => {
    const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `following?address=${addressUserA}`,
    );

    assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
    assert.isOk(response && response.rows.find(x => x.address === addressUserB));
  });

  it('gET - /followers', async () => {
    const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `followers?address=${addressUserB}`,
    );

    assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
    assert.isOk(response && response.rows.find(x => x.address === addressUserA));
  });

  // Unfollow
  it('pOST - /unfollow', async () => {
    const body: Posts.UnfollowBody = {
      hash: getRandomHash(),
      from: addressUserA,
      address: addressUserB,
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`unfollow`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
  });

  it('gET - /is-following (Not Following)', async () => {
    const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `is-following?follower=${addressUserA}&following=${addressUserB}`,
    );

    assert.isOk(response?.status === 404, 'follower was found, should not have follower');
  });

  it('gET - /followers - user B', async () => {
    const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `followers?address=${addressUserB}`,
    );
    assert.isOk(response && Array.isArray(response.rows), 'followers response was not an array');
    assert.isOk(response && response.rows.length <= 0, 'did not unfollow all users');
  });

  it('gET - /following - empty', async () => {
    const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
      `following?address=${addressUserA}`,
    );
    assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
    assert.isOk(response && response.rows.length <= 0, 'did not unfollow all users');
  });
});
