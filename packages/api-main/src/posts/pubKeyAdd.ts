import type { Posts } from '@atomone/dither-api-types';
import type { Cookie } from 'elysia';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { UsersTable } from '../../drizzle/schema';
import { verifyJWT } from '../shared/jwt';

export async function PubKeyAdd(body: typeof Posts.AddPublicKey.static, auth: Cookie<string | undefined>) {
    const publicKey = await verifyJWT(auth.value);
    if (typeof publicKey === 'undefined') {
        return { status: 401, error: 'Unauthorized token proivided' };
    }

    if (body.key.length !== 44) {
        return { status: 400, error: 'Malformed removal request, key must be 44 characters' };
    }

    try {
        const rows = await getDatabase().select().from(UsersTable).where(eq(UsersTable.address, publicKey)).limit(1);
        const keys: string[] = rows.length >= 1 ? [...rows[0].keys, body.key] : [body.key];

        await getDatabase()
            .insert(UsersTable)
            .values({
                address: publicKey,
                keys,
            })
            .onConflictDoUpdate({
                target: UsersTable.address,
                set: {
                    keys: Array.from(new Set(keys)),
                },
            }).execute();

        return { status: 200 };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to remove key from user' };
    }
}
