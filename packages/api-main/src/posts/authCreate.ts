import { type Posts } from '@atomone/dither-api-types';

import { useUserAuth } from '../shared/useUserAuth';

const { add } = useUserAuth();

export async function AuthCreate(body: typeof Posts.AuthCreateBody.static) {
    try {
        const result = await add(body.address);
        return { status: 200, ...result };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to create authorization request' };
    }
}
