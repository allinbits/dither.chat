import type { Cookie } from 'elysia';

import { type Posts } from '@atomone/dither-api-types';

import { useConfig } from '../config';
import { useUserAuth } from '../shared/useUserAuth';

const { verifyAndCreate } = useUserAuth();
const { JWT_STRICTNESS } = useConfig();

export async function Auth(body: typeof Posts.AuthBody.static, auth: Cookie<string | undefined>) {
    try {
        if ('json' in body) {
            const jwt = await verifyAndCreate(body.pub_key.value, body.signature, body.id);
            return jwt;
        }

        const result = await verifyAndCreate(body.pub_key.value, body.signature, body.id);
        if (result.status === 200) {
            auth.remove();
            auth.set({ sameSite: JWT_STRICTNESS, httpOnly: true, value: result.bearer, maxAge: 259200, priority: 'high' });
            return { status: 200 };
        }

        return result;
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'unauthorized signature or key provided, failed to verify' };
    }
}
