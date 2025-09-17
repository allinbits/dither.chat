import { type Posts } from '@atomone/dither-api-types';

import { useRateLimiter } from '../shared/useRateLimiter';
import { useUserAuth } from '../shared/useUserAuth';
import { getRequestIP } from '../utility';

const { add } = useUserAuth();
const rateLimiter = useRateLimiter();

export async function AuthCreate(body: typeof Posts.AuthCreateBody.static, request: Request) {
    const ip = getRequestIP(request);
    if (rateLimiter.isLimited(ip)) {
        return { status: 429, error: 'Too many requests, try again later' };
    }

    rateLimiter.update(ip);

    try {
        const result = await add(body.address);
        return { status: 200, ...result };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to create authorization request' };
    }
}
