import type { Posts } from '@atomone/dither-api-types';

import { assert, describe, it } from 'vitest';

import { createWallet, get, post, signADR36Document } from './shared';

describe('v1/auth', async () => {
  const walletA = await createWallet();

  it('create and verify request for wallet', async () => {
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

    const responseVerifyCreated = (await post(`auth`, verifyBody)) as { status: 200; bearer: string };
    assert.isOk(responseVerifyCreated?.status === 200, 'response was not verified and confirmed okay');
    assert.isOk(responseVerifyCreated.bearer.length >= 1, 'bearer was not passed back');

    const responseVerify = await get('auth-verify', responseVerifyCreated.bearer) as { status: number };
    assert.isOk(responseVerify.status === 200, 'could not verify through auth-verify endpoint, invalid cookie?');
  });
});
