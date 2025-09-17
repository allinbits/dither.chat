import { type Posts } from '@atomone/dither-api-types';

import { useUserAuth } from '../shared/useUserAuth';

const { add } = useUserAuth();

export async function AuthCreate(body: typeof Posts.AuthCreateBody.static, request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('true-client-ip') || request.headers.get('cf-connecting-ip');
    console.log(ip);
    console.log(request.headers);

    try {
        const result = await add(body.address);
        return { status: 200, ...result };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to create authorization request' };
    }
}
