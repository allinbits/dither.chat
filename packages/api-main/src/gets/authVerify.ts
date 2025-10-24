import type { Cookie } from 'elysia';

import { verifyJWT } from '../shared/jwt';

export async function AuthVerify(auth: Cookie<string | undefined>) {
  try {
    const response = await verifyJWT(auth.value);
    if (typeof response === 'undefined') {
      return { status: 401, error: 'Unauthorized token proivided' };
    }

    return typeof response === 'undefined' ? { status: 401, error: 'token expired' } : { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 401, error: 'unauthorized signature or key provided, failed to verify' };
  }
}
