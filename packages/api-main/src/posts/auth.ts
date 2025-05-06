import { t } from 'elysia';

import { useUserAuth } from '../shared/useUserAuth';

export const AuthBody = t.Object({
    id: t.Number(),
    pub_key: t.Object({ type: t.String(), value: t.String() }),
    signature: t.String(),
});

const { verify } = useUserAuth();

export async function Auth(body: typeof AuthBody.static) {
    try {
        return verify(body.pub_key.value, body.signature, body.id);
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
