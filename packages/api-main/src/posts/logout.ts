import type { Cookie } from 'elysia';

export async function Logout(auth: Cookie<string | undefined>) {
  try {
    auth.remove();
    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'unauthorized signature or key provided, failed to verify' };
  }
}
