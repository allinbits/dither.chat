import type { Cookie } from 'elysia';

import { type Posts } from '@atomone/dither-api-types';

import { useUserAuth } from '../shared/useUserAuth';

const { verify } = useUserAuth();

export async function Auth(body: typeof Posts.AuthBody.static, auth: Cookie<string | undefined>) {
    try {
        if (Object.hasOwn(body, 'json')) {
            return verify(body.pub_key.value, body.signature, body.id);
        }

        const result = verify(body.pub_key.value, body.signature, body.id);
        if (result.status === 200) {
            auth.set({ sameSite: 'strict', httpOnly: false, value: result.bearer });
            return { status: 200 };
        }
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'unauthorized signature or key provided, failed to verify' };
    }
}
