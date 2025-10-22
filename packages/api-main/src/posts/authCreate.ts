import type { Posts } from '@atomone/dither-api-types';

import { useRateLimiter } from '../shared/useRateLimiter';
import { useUserAuth } from '../shared/useUserAuth';
import { getRequestIP } from '../utility';

const { add } = useUserAuth();
const rateLimiter = useRateLimiter();

export async function AuthCreate(body: typeof Posts.AuthCreateBody.static, request: Request) {
  const ip = getRequestIP(request);
  const isLimited = await rateLimiter.isLimited(ip);
  if (isLimited) {
    return { status: 429, error: 'Too many requests, try again later' };
  }

  await rateLimiter.update(ip);

  try {
    const result = await add(body.address);
    return { status: 200, ...result };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to create authorization request' };
  }
}
