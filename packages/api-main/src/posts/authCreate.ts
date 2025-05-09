import { t } from 'elysia';

import { useUserAuth } from '../shared/useUserAuth';

export const AuthCreateBody = t.Object({
    address: t.String(),
});

const { add } = useUserAuth();

export async function AuthCreate(body: typeof AuthCreateBody.static) {
    try {
        return { status: 200, ...add(body.address) };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to create authorization request' };
    }
}
