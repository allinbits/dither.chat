import { useRateLimiter } from '../shared/useRateLimiter';
import { getRequestIP } from '../utility';

const rateLimiter = useRateLimiter();

/**
 * Middleware to apply rate limiting based on client IP.
 * Uses getRequestIP utility for consistent IP extraction across the codebase.
 *
 * @returns Error response if rate limited, undefined to continue
 */
export async function rateLimitMiddleware(context: { request: Request }) {
  const clientIp = getRequestIP(context.request);

  if (await rateLimiter.isLimited(clientIp)) {
    return { status: 429, error: 'Too many requests. Please try again later.' };
  }

  await rateLimiter.update(clientIp);
}
