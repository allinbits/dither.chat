import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { get, getAtomOneAddress, getRandomHash, post } from './shared';

describe('should search for posts', async () => {
    const addressUserA = getAtomOneAddress();

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
