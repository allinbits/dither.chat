import { t } from 'elysia';

import { useUserAuth } from '../shared/useUserAuth';

export const AuthBody = t.Object({
    pub_key: t.Object({ type: t.String(), value: t.String() }),
    signature: t.String(),
    nonce: t.String(),
});

const { verify } = useUserAuth();

export async function Auth(body: typeof AuthBody.static) {
    try {
        const result = verify(body.pub_key.value, body.signature, body.nonce);
        return { status: 200, result };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
