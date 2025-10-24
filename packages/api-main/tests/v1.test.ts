import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { createPost, get, getAtomOneAddress, getRandomHash, post } from './shared';

describe('v1', { sequential: true }, async () => {
  const addressUserA = getAtomOneAddress();
  const replyHash = getRandomHash();
  const genericPostMessage
    = 'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';

  // Posts
  it('pOST - /post', async () => {
    const body: typeof Posts.PostBody.static = {
      from: addressUserA,
      hash: getRandomHash(),
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const response = await post(`post`, body);
    assert.isOk(response?.status === 200, 'response was not okay');
  });

  it('pOST - /reply', async () => {
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `feed`,
    );
    assert.isOk(response, 'failed to fetch feed data');
    assert.isOk(
      response && Array.isArray(response.rows) && response.rows.length >= 1,
      'feed result was not an array type',
    );

    const body: typeof Posts.ReplyBody.static = {
      from: addressUserA,
      hash: replyHash,
      post_hash: response.rows[0].hash,
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const replyResponse = await post(`reply`, body);
    assert.isOk(replyResponse?.status === 200, 'response was not okay');
  });

  it('gET - /feed', async () => {
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `feed`,
    );
    assert.isOk(response, 'failed to fetch feed data');
    assert.isOk(
      response && Array.isArray(response.rows) && response.rows.length >= 1,
      'feed result was not an array type',
    );

    const message = response.rows.find(x => x.author === addressUserA && x.message === genericPostMessage);
    assert.isOk(message);
  });

  it('gET - /posts', async () => {
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `posts?address=${addressUserA}`,
    );
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(
      response && Array.isArray(response.rows) && response.rows.length >= 1,
      'feed result was not an array type',
    );
  });

  // Likes
  const likeablePost = await createPost('A Likeable Post');
  it ('should have a likeable post', () => {
    assert.isOk(likeablePost);
  });

  it('pOST - /like', async () => {
    if (!likeablePost) {
      assert.fail('Likeable post does not exist');
    }

    for (let i = 0; i < 50; i++) {
      const body: typeof Posts.LikeBody.static = {
        from: addressUserA,
        hash: getRandomHash(),
        post_hash: likeablePost?.hash,
        quantity: '1',
        timestamp: '2025-04-16T19:46:42Z',
      };

      const likeResponse = await post(`like`, body);
      assert.isOk(likeResponse != null);
      assert.isOk(likeResponse && likeResponse.status === 200, 'response was not okay');
    }
  });

  it('gET - /likes', async () => {
    if (!likeablePost) {
      assert.fail('Likeable post does not exist');
    }

    const response = await get<{ status: number; rows: { hash: string; likes: number }[] }>(
      `post?hash=${likeablePost.hash}`,
    );

    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
    assert.isOk(response && response.rows[0].likes >= 50, 'likes were not incremented on post');
  });

  // Dislikes
  const dislikeablePost = await createPost('A Dislikeable Post');
  it ('should have a dislikeable post', () => {
    assert.isOk(dislikeablePost);
  });

  it('pOST - /dislike', async () => {
    if (!dislikeablePost) {
      assert.fail('Likeable post does not exist');
    }

    for (let i = 0; i < 50; i++) {
      const body: typeof Posts.DislikeBody.static = {
        from: addressUserA,
        hash: getRandomHash(),
        post_hash: dislikeablePost.hash,
        quantity: '1',
        timestamp: '2025-04-16T19:46:42Z',
      };

      const dislikeResponse = await post(`dislike`, body);
      assert.isOk(dislikeResponse != null);
      assert.isOk(dislikeResponse && dislikeResponse.status === 200, 'response was not okay');
    }
  });

  it('gET - /dislikes', async () => {
    if (!dislikeablePost) {
      assert.fail('Likeable post does not exist');
    }

    const response = await get<{
      status: number;
      rows: { hash: string; author: string; message: string; dislikes: number }[];
    }>(`post?hash=${dislikeablePost.hash}`);
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
    assert.isOk(response && response.rows[0].dislikes >= 50, 'likes were not incremented on post');
  });

  // Flags
  const flagPost = await createPost('A Dislikeable Post');
  it ('should have a dislikeable post (flag)', () => {
    assert.isOk(flagPost);
  });

  it('pOST - /flag', async () => {
    if (!flagPost) {
      assert.fail('Likeable post does not exist');
    }

    for (let i = 0; i < 50; i++) {
      const body: typeof Posts.FlagBody.static = {
        from: addressUserA,
        hash: getRandomHash(),
        post_hash: flagPost.hash,
        quantity: '1',
        timestamp: '2025-04-16T19:46:42Z',
      };

      const flagResponse = await post(`flag`, body);
      assert.isOk(flagResponse != null);
      assert.isOk(flagResponse && flagResponse.status === 200, 'response was not okay');
    }
  });

  it('gET - /flags', async () => {
    if (!flagPost) {
      assert.fail('Likeable post does not exist');
    }

    const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
      `flags?hash=${flagPost.hash}`,
    );
    assert.isOk(getResponse, 'failed to fetch posts data');
    assert.isOk(getResponse.status === 200, 'flags result was not valid');
    assert.isOk(
      getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
      'feed result was not an array type',
    );
  });

  // PostRemove
  it('pOST - /post-remove', async () => {
    const bodyPost: typeof Posts.PostBody.static = {
      from: addressUserA,
      hash: getRandomHash(),
      msg: genericPostMessage,
      quantity: '1',
      timestamp: '2025-04-16T19:46:42Z',
    };

    const responsePost = await post(`post`, bodyPost);
    assert.isOk(responsePost?.status === 200, 'response was not okay');

    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `posts?address=${addressUserA}`,
    );
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

    const body: typeof Posts.PostRemoveBody.static = {
      from: addressUserA,
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: response.rows[0].hash,
    };

    const replyResponse = await post(`post-remove`, body);
    assert.isOk(replyResponse?.status === 200, 'response was not okay');

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

  it('pOST - /post-remove - No Permission', async () => {
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `posts?address=${addressUserA}`,
    );
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

    const body: typeof Posts.PostRemoveBody.static = {
      from: `${addressUserA}abcd`,
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: response.rows[0].hash,
    };

    const replyResponse = await post(`post-remove`, body);
    assert.isOk(replyResponse?.status === 200, 'response was not okay');

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

  it('pOST - /mod/post-remove - No Permission', async () => {
    const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
      `posts?address=${addressUserA}`,
    );
    assert.isOk(response, 'failed to fetch posts data');
    assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

    const body: typeof Posts.PostRemoveBody.static = {
      from: `${addressUserA}abcd`,
      hash: getRandomHash(),
      timestamp: '2025-04-16T19:46:42Z',
      post_hash: response.rows[0].hash,
    };

    const replyResponse = await post(`post-remove`, body);
    assert.isOk(replyResponse?.status === 200, 'response was not okay');

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
});
