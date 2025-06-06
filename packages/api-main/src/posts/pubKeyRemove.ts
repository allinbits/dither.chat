import type { Posts } from '@atomone/dither-api-types';
import type { Cookie } from 'elysia';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { UsersTable } from '../../drizzle/schema';
import { verifyJWT } from '../shared/jwt';

export async function PubKeyRemove(body: typeof Posts.RemovePublicKey.static, auth: Cookie<string | undefined>) {
    const publicKey = await verifyJWT(auth.value);
    if (typeof publicKey === 'undefined') {
        return { status: 401, error: 'Unauthorized token proivided' };
    }

    if (body.key.length !== 44) {
        return { status: 400, error: 'Malformed removal request, key must be 44 characters' };
    }

    try {
        const rows = await getDatabase().select().from(UsersTable).where(eq(UsersTable.address, publicKey)).limit(1);
        if (rows.length <= 0) {
            return { status: 404, error: 'User is not storing any keys' };
        }

        const keys: string[] = rows[0].keys;
        const idx = keys.findIndex(x => x === body.key);
        if (idx <= -1) {
            return { status: 404, error: 'User is not storing that key' };
        }

        keys.splice(idx, 1);

        await getDatabase()
            .update(UsersTable)
            .set({
                keys: Array.from(new Set(keys)),
            }).where(
                eq(UsersTable.address, publicKey),
            ).execute();

        return { status: 200 };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to remove key from user' };
    }
}
