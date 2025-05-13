import { type Posts } from '@atomone/dither-api-types';

import { useUserAuth } from '../shared/useUserAuth';

const { verify } = useUserAuth();

export async function Auth(body: typeof Posts.AuthBody.static) {
    try {
        return verify(body.pub_key.value, body.signature, body.id);
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'unauthorized signature or key provided, failed to verify' };
    }
}
