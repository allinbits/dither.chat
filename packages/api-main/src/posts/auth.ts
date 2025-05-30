import type { Cookie } from 'elysia';

import { type Posts } from '@atomone/dither-api-types';

import { useUserAuth } from '../shared/useUserAuth';

const { verifyAndCreate } = useUserAuth();

export async function Auth(body: typeof Posts.AuthBody.static, auth: Cookie<string | undefined>) {
    try {
        if (Object.hasOwn(body, 'json')) {
            return verifyAndCreate(body.pub_key.value, body.signature, body.id);
        }

        const result = verifyAndCreate(body.pub_key.value, body.signature, body.id);
        if (result.status === 200) {
            auth.set({ sameSite: 'strict', httpOnly: false, value: result.bearer, maxAge: 259200 });
            return { status: 200 };
        }
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'unauthorized signature or key provided, failed to verify' };
    }
}
