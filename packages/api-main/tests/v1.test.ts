import '../src/index';

import type { Posts } from '@atomone/dither-api-types';

import { eq, sql } from 'drizzle-orm';
import { assert, describe, it } from 'vitest';

import { getDatabase } from '../drizzle/db';
import { ModeratorTable, ReaderState, tables } from '../drizzle/schema';

import { createWallet, get, getAtomOneAddress, getRandomHash, post, signADR36Document, userLogin } from './shared';

describe('v1', { sequential: true }, () => {
    const addressUserA = getAtomOneAddress();
    const addressUserB = getAtomOneAddress();
    const addressUserC = getAtomOneAddress();
    const replyHash = getRandomHash();
    const genericPostMessage
        = 'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';

    it('EMPTY ALL TABLES', async () => {
        for (const tableName of tables) {
            await getDatabase().execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    });

    // Posts
    it('GET - /feed (Check Empty)', async () => {
        const response = await get<{ status: number; rows: { hash: string }[] }>(`feed`);
        assert.isOk(response, 'failed to fetch feed data');
        assert.isOk(
            response && Array.isArray(response.rows) && response.rows.length <= 0,
            'feed result was not an array type',
        );
    });

    it('POST - /post', async () => {
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

    it('POST - /reply', async () => {
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

    it('GET - /feed', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `feed`,
        );
        assert.isOk(response, 'failed to fetch feed data');
        assert.isOk(
            response && Array.isArray(response.rows) && response.rows.length >= 1,
            'feed result was not an array type',
        );

        assert.isOk(response.rows[0].author === addressUserA, 'author address did not match poster');
        assert.isOk(response.rows[0].message === genericPostMessage, 'message did not match original post');
    });

    it('GET - /posts', async () => {
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
    it('POST - /like', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `post?hash=${replyHash}`,
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        for (let i = 0; i < 50; i++) {
            const body: typeof Posts.LikeBody.static = {
                from: addressUserA,
                hash: getRandomHash(),
                post_hash: response.rows[0].hash,
                quantity: '1',
                timestamp: '2025-04-16T19:46:42Z',
            };

            const likeResponse = await post(`like`, body);
            assert.isOk(likeResponse != null);
            assert.isOk(likeResponse && likeResponse.status === 200, 'response was not okay');
        }
    });

    it('GET - /likes', async () => {
        const response = await get<{ status: number; rows: { hash: string; likes: number }[] }>(
            `post?hash=${replyHash}`,
        );

        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        assert.isOk(response && response.rows[0].likes >= 50, 'likes were not incremented on post');

        const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
            `likes?hash=${response.rows[0].hash}`,
        );
        assert.isOk(getResponse, 'failed to fetch posts data');
        assert.isOk(getResponse.status == 200, 'likes result was not valid');
        assert.isOk(
            getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
            'feed result was not an array type',
        );
    });

    // Dislikes
    it('POST - /dislike', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `post?hash=${replyHash}`,
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

        for (let i = 0; i < 50; i++) {
            const body: typeof Posts.DislikeBody.static = {
                from: addressUserA,
                hash: getRandomHash(),
                post_hash: response.rows[0].hash,
                quantity: '1',
                timestamp: '2025-04-16T19:46:42Z',
            };

            const dislikeResponse = await post(`dislike`, body);
            assert.isOk(dislikeResponse != null);
            assert.isOk(dislikeResponse && dislikeResponse.status === 200, 'response was not okay');
        }
    });

    it('GET - /dislikes', async () => {
        const response = await get<{
            status: number;
            rows: { hash: string; author: string; message: string; dislikes: number }[];
        }>(`post?hash=${replyHash}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        assert.isOk(response && response.rows[0].dislikes >= 50, 'likes were not incremented on post');

        const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
            `dislikes?hash=${response.rows[0].hash}`,
        );
        assert.isOk(getResponse, 'failed to fetch posts data');
        assert.isOk(getResponse.status == 200, 'dislikes result was not valid');
        assert.isOk(
            getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
            'feed result was not an array type',
        );
    });

    // Flags
    it('POST - /flag', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `post?hash=${replyHash}`,
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        for (let i = 0; i < 50; i++) {
            const body: typeof Posts.FlagBody.static = {
                from: addressUserA,
                hash: getRandomHash(),
                post_hash: response.rows[0].hash,
                quantity: '1',
                timestamp: '2025-04-16T19:46:42Z',
            };

            const flagResponse = await post(`flag`, body);
            assert.isOk(flagResponse != null);
            assert.isOk(flagResponse && flagResponse.status === 200, 'response was not okay');
        }
    });

    it('GET - /flags', async () => {
        const response = await get<{
            status: number;
            rows: { hash: string; author: string; message: string; flags: number }[];
        }>(`post?hash=${replyHash}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        assert.isOk(response && response.rows[0].flags >= 50, 'likes were not incremented on post');

        const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
            `flags?hash=${response.rows[0].hash}`,
        );
        assert.isOk(getResponse, 'failed to fetch posts data');
        assert.isOk(getResponse.status == 200, 'flags result was not valid');
        assert.isOk(
            getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
            'feed result was not an array type',
        );
    });

    // Follows
    it('POST - /follow', async () => {
        const body: typeof Posts.FollowBody.static = {
            from: addressUserA,
            hash: getRandomHash(),
            address: addressUserB,
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`follow`, body);
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('GET - /is-following', async () => {
        let response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `is-following?follower=${addressUserA}&following=${addressUserB}`,
        );

        assert.isOk(response?.status === 200, 'follower was not found, should have follower');
        response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `is-following?follower=${addressUserA}&following=${addressUserC}`,
        );

        assert.isOk(response?.status === 404, 'follower was found when follower should not be following anyone');
    });

    it('POST - /follow - no duplicates', async () => {
        const body: typeof Posts.FollowBody.static = {
            hash: getRandomHash(),
            from: addressUserA,
            address: addressUserB,
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`follow`, body, 'WRITE');
        assert.isOk(response?.status === 400, 'additional follow was allowed somehow');
    });

    it('GET - /following', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `following?address=${addressUserA}`,
        );

        assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
        assert.isOk(response && response.rows.find(x => x.address === addressUserB));
    });

    it('GET - /followers', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `followers?address=${addressUserB}`,
        );

        assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
        assert.isOk(response && response.rows.find(x => x.address === addressUserA));
    });

    // Unfollow
    it('POST - /unfollow', async () => {
        const body: typeof Posts.UnfollowBody.static = {
            hash: getRandomHash(),
            from: addressUserA,
            address: addressUserB,
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`unfollow`, body);
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('GET - /is-following (Not Following)', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `is-following?follower=${addressUserA}&following=${addressUserB}`,
        );

        assert.isOk(response?.status === 404, 'follower was found, should not have follower');
    });

    it('GET - /followers', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `followers?address=${addressUserB}`,
        );
        assert.isOk(response && Array.isArray(response.rows), 'followers response was not an array');
        assert.isOk(response && response.rows.length <= 0, 'did not unfollow all users');
    });

    it('GET - /following', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `following?address=${addressUserA}`,
        );
        assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
        assert.isOk(response && response.rows.length <= 0, 'did not unfollow all users');
    });

    // PostRemove
    it('POST - /post-remove', async () => {
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

    it('POST - /post-remove - No Permission', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `posts?address=${addressUserA}`,
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

        const body: typeof Posts.PostRemoveBody.static = {
            from: addressUserA + 'abcd',
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

    it('POST - /mod/post-remove - No Permission', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `posts?address=${addressUserA}`,
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

        const body: typeof Posts.PostRemoveBody.static = {
            from: addressUserA + 'abcd',
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

describe('v1 - mod', { sequential: true }, () => {
    const addressUserA = getAtomOneAddress();
    let addressModerator = getAtomOneAddress();
    const genericPostMessage
        = 'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';
    const postHash = getRandomHash();
    const secondPostHash = getRandomHash();
    let bearerToken: string;

    it('EMPTY ALL TABLES', async () => {
        for (const tableName of tables) {
            await getDatabase().execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    });

    it('POST mod obtain bearer token', async () => {
        const walletA = await createWallet();
        addressModerator = walletA.publicKey;
        const body: typeof Posts.AuthCreateBody.static = {
            address: walletA.publicKey,
        };

        const response = (await post(`auth-create`, body, 'READ')) as { status: 200; id: number; message: string };
        assert.isOk(response?.status === 200, 'response was not okay');

        const signData = await signADR36Document(walletA.mnemonic, response.message);
        const verifyBody: typeof Posts.AuthBody.static & { json?: boolean } = {
            id: response.id,
            ...signData.signature,
            json: true,
        };

        const responseVerify = (await post(`auth`, verifyBody, 'READ')) as { status: 200; bearer: string };
        assert.isOk(responseVerify?.status === 200, 'response was not verified and confirmed okay');
        assert.isOk(responseVerify.bearer.length >= 1, 'bearer was not passed back');
        bearerToken = responseVerify.bearer;
    });

    it('POST - /post', async () => {
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

    it('POST - /mod/post-remove without autorization', async () => {
        const body: typeof Posts.ModRemovePostBody.static = {
            hash: getRandomHash(),
            timestamp: '2025-04-16T19:46:42Z',
            post_hash: postHash,
            reason: 'spam',
        };

        const replyResponse = await post(`mod/post-remove`, body);
        assert.isOk(replyResponse?.status === 401, `expected unauthorized, got ${JSON.stringify(replyResponse)}`);
    });

    it('POST - /mod/post-remove moderator does not exists', async () => {
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

        const replyResponse = await post(`mod/post-remove`, body, 'WRITE', bearerToken);
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

    it('POST - /mod/post-remove moderator exists', async () => {
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

        const replyResponse = await post(`mod/post-remove`, body, 'WRITE', bearerToken);
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

    it('POST - /mod/post-restore', async () => {
        const body: typeof Posts.ModRemovePostBody.static = {
            hash: getRandomHash(),
            timestamp: '2025-04-16T19:46:42Z',
            post_hash: postHash,
            reason: 'spam',
        };

        const replyResponse = await post(`mod/post-restore`, body, 'WRITE', bearerToken);
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

    it('POST - /mod/post-restore on an user deleted post', async () => {
        // USER REMOVES POST
        const body: typeof Posts.PostRemoveBody.static = {
            from: addressUserA,
            hash: getRandomHash(),
            timestamp: '2025-04-16T19:46:42Z',
            post_hash: postHash,
        };

        const userRemoveResponse = await post(`post-remove`, body, 'WRITE', bearerToken);
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

    it('POST - /post user creates a second post', async () => {
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

    it('POST - /mod/ban user banned deletes posts', async () => {
        // moderator bans user
        const body: typeof Posts.ModBanBody.static = {
            hash: getRandomHash(),
            timestamp: '2025-04-16T19:46:42Z',
            user_address: addressUserA,
            reason: 'user too political',
        };

        const userBanResponse = await post(`mod/ban`, body, 'WRITE', bearerToken);
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
            Array.isArray(postsResponse.rows) && postsResponse.rows.length == 0,
            'some of the user posts are shown',
        );
    });

    it('POST - banned user publishes post is deleted automatically', async () => {
        const body: typeof Posts.PostBody.static = {
            from: addressUserA,
            hash: getRandomHash(),
            msg: genericPostMessage,
            quantity: '1',
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`post`, body, 'WRITE', bearerToken);
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
            Array.isArray(postsResponse.rows) && postsResponse.rows.length == 0,
            'some of the user posts are shown',
        );
    });

    it('POST - unban restore all posts but user deleted ones', async () => {
        const body: typeof Posts.ModBanBody.static = {
            hash: getRandomHash(),
            timestamp: '2025-04-16T19:46:42Z',
            user_address: addressUserA,
            reason: 'user too political',
        };

        const userBanResponse = await post(`mod/unban`, body, 'WRITE', bearerToken);
        assert.isOk(userBanResponse?.status === 200, `response was not okay ${JSON.stringify(userBanResponse)}`);

        // Totally user should have 2 post as one was deleted by itself (including the one posted while banned)
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
            Array.isArray(postsResponse.rows) && postsResponse.rows.length == 2,
            `invalid number of posts, expeted 2, got ${postsResponse.rows.length}`,
        );
    });

    it('POST - freshly unbanned user publishes without problems', async () => {
        const newPostHash = getRandomHash();
        const body: typeof Posts.PostBody.static = {
            from: addressUserA,
            hash: newPostHash,
            msg: genericPostMessage,
            quantity: '1',
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`post`, body, 'WRITE', bearerToken);
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

    it('Search - /search', async () => {
        const body: typeof Posts.PostBody.static = {
            from: addressUserA,
            hash: getRandomHash(),
            msg: 'this is a very unique message with a very unique result',
            quantity: '1',
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`post`, body);
        assert.isOk(response?.status === 200, 'response was not okay');

        const results1 = await get<{ status: number; rows: { message: string }[] }>(
            'search?text="very unique message"',
        );
        assert.isOk(results1?.status === 200);
        assert.isOk(results1.rows.length === 1);

        const results2 = await get<{ status: number; rows: { message: string }[] }>(
            'search?text="supercalifragilisticexpialidocious"',
        );
        assert.isOk(results2?.status === 200);
        assert.isOk(results2.rows.length <= 0);
    });

    it('Search - /search post with owner', async () => {
        const body: typeof Posts.PostBody.static = {
            from: addressUserA,
            hash: getRandomHash(),
            msg: 'content not related at all with owner',
            quantity: '1',
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`post`, body);
        assert.isOk(response?.status === 200, 'response was not okay');

        const results1 = await get<{ status: number; rows: { message: string }[]; users: string[] }>(
            `search?text=${addressUserA}`,
        );
        assert.isOk(results1?.status === 200);
        assert.isOk(results1.rows.length > 1);
        assert.isOk(results1.users.length === 1);
        assert.isOk(results1.users[0] === addressUserA);
    });
});

describe('v1/auth', async () => {
    const walletA = await createWallet();

    it('create and verify request for wallet', async () => {
        const body: typeof Posts.AuthCreateBody.static = {
            address: walletA.publicKey,
        };

        const response = (await post(`auth-create`, body, 'READ')) as { status: 200; id: number; message: string };
        assert.isOk(response?.status === 200, 'response was not okay');

        const signData = await signADR36Document(walletA.mnemonic, response.message);
        const verifyBody: typeof Posts.AuthBody.static & { json?: boolean } = {
            id: response.id,
            ...signData.signature,
            json: true,
        };

        const responseVerifyCreated = (await post(`auth`, verifyBody, 'READ')) as { status: 200; bearer: string };
        assert.isOk(responseVerifyCreated?.status === 200, 'response was not verified and confirmed okay');
        assert.isOk(responseVerifyCreated.bearer.length >= 1, 'bearer was not passed back');

        const responseVerify = await get('auth-verify', 'READ', responseVerifyCreated.bearer) as { status: number };
        assert.isOk(responseVerify.status === 200, 'could not verify through auth-verify endpoint, invalid cookie?');
    });
});

describe('v1/notifications', async () => {
    const walletA = await createWallet();
    const walletB = await createWallet();

    let bearerToken: string;

    it('User obtains bearer token', async () => {
        bearerToken = await userLogin(walletB);
        assert.isOk(bearerToken.length >= 1, 'bearer was not passed back');
    });
    // Follows
    it('POST - /follow', async () => {
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
        }>(`notifications?address=${walletB.publicKey}`, 'READ', bearerToken);
        // Asert user got a notification and can read it
        assert.isOk(notificationResponse?.status === 200, `response was not okay, got ${notificationResponse?.status}`);
        assert.lengthOf(notificationResponse.rows, 1);
        assert.isFalse(notificationResponse.rows[0].was_read, `notification was not marked as read, got true`);
        assert.isOk(notificationResponse.rows[0].actor === walletA.publicKey, `unexpected actor, got ${notificationResponse.rows[0].actor}`);

        const readResponse = await get<{
            status: number;
        }>(
            `notification-read?address=${walletB.publicKey}&hash=${notificationResponse.rows[0].hash}`,
            'WRITE',
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
        }>(`notifications?address=${walletB.publicKey}`, 'READ', bearerToken);

        assert.isOk(lastResponse?.rows.findIndex(x => x.hash == notificationResponse.rows[0].hash) === -1, 'notification was still available in array');
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
        assert.isOk(likeResponse && likeResponse.status === 200, 'response was not okay got ' + likeResponse.status);

        // Login as userA
        bearerToken = await userLogin(walletA);
        assert.isOk(bearerToken.length >= 1, 'bearer was not passed back');

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
        }>(`notifications?address=${walletA.publicKey}`, 'READ', bearerToken);
        // Asert user got a notification and can read it
        assert.isOk(notificationResponse?.status === 200, `response was not okay, got ${notificationResponse?.status}`);
        assert.lengthOf(notificationResponse.rows, 1);
        assert.isFalse(notificationResponse.rows[0].was_read, `notification was not marked as read, got true`);
        assert.isOk(notificationResponse.rows[0].actor === walletB.publicKey, `unexpected actor, got ${notificationResponse.rows[0].actor}`);

        const readResponse = await get<{
            status: number;
        }>(
            `notification-read?address=${walletA.publicKey}&hash=${notificationResponse.rows[0].hash}`,
            'WRITE',
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
        }>(`notifications?address=${walletA.publicKey}`, 'READ', bearerToken);

        assert.isOk(lastResponse?.rows.findIndex(x => x.hash == notificationResponse.rows[0].hash) === -1, 'notification was still available in array');
    });
});

describe('user replies with parent', async () => {
    const walletA = await createWallet();
    const walletB = await createWallet();
    const parentPost = getRandomHash();
    const replyPost = getRandomHash();
    const postMessage = 'this is a post';
    const replyMessage = 'this is a reply';

    it('POST - /post', async () => {
        const body: typeof Posts.PostBody.static = {
            from: walletA.publicKey,
            hash: parentPost,
            msg: postMessage,
            quantity: '1',
            timestamp: '2025-04-16T19:46:42Z',
        };

        const response = await post(`post`, body);
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('POST - /reply', async () => {
        const body: typeof Posts.ReplyBody.static = {
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

    it('Get user replies', async () => {
        const userRepliesResponse = await get<{
            status: number;
            rows: {
                parent: { hash: string; author: string; message: string };
                reply: { hash: string; author: string; message: string };
            }[];
        }>(`user-replies?address=${walletB.publicKey}`, 'READ');
        assert.isOk(userRepliesResponse?.status === 200, `response was not okay, got ${userRepliesResponse?.status}`);
        assert.lengthOf(userRepliesResponse.rows, 1);
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
        }>(`following-posts?address=${walletA.publicKey}`, 'READ');
        assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
        assert.lengthOf(readResponse.rows, 0);
    });

    it('POST - now followed user posts', async () => {
        const body: typeof Posts.PostBody.static = {
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

    it('Still empty response', async () => {
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
        }>(`following-posts?address=${walletA.publicKey}`, 'READ');
        assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
        assert.lengthOf(readResponse.rows, 0);
    });

    it('One post when user follows', async () => {
        const body: typeof Posts.FollowBody.static = {
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
        }>(`following-posts?address=${walletA.publicKey}`, 'READ');
        assert.isOk(readResponse?.status === 200, `response was not okay, got ${readResponse?.status}`);
        assert.lengthOf(readResponse.rows, 1);
        assert.isOk(readResponse.rows[0].author, 'Author was not included');
        assert.isOk(readResponse.rows[0].message, 'message was not included');
        assert.isOk(readResponse.rows[0].quantity, 'quantity was not included');
    });
});

describe('update state', () => {
    it('should update state', async () => {
        let response = await post<{ status: number; error: string }>(`update-state`, { last_block: '1' });
        assert.isOk(response?.status === 200, 'could not post to update state');

        let [state] = await getDatabase().select().from(ReaderState).where(eq(ReaderState.id, 0)).limit(1);
        assert.isOk(state.last_block == '1');

        response = await post<{ status: number; error: string }>(`update-state`, { last_block: '2' });
        assert.isOk(response?.status === 200, 'could not post to update state');

        [state] = await getDatabase().select().from(ReaderState).where(eq(ReaderState.id, 0)).limit(1);
        assert.isOk(state.last_block == '2');
    });
});

describe('filter post depending on send tokens', async () => {
    const walletB = await createWallet();
    const cheapPostMessage = 'cheap post';
    const expensivePostMessage = 'expensive post';
    const expensivePostTokens = '20';

    it('EMPTY ALL TABLES', async () => {
        for (const tableName of tables) {
            await getDatabase().execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    });

    it('user creates one cheap and one expensive posts', async () => {
        const body: typeof Posts.PostBody.static = {
            from: walletB.publicKey,
            hash: getRandomHash(),
            msg: cheapPostMessage,
            quantity: '1',
            timestamp: '2025-04-16T19:46:42Z',
        };

        let postResponse = await post(`post`, body);

        const expensiveBody: typeof Posts.PostBody.static = {
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
        assert.lengthOf(readResponse.rows, 2);
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

    it('Search: filtering cheap posts', async () => {
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
