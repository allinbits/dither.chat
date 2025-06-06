import type { Cookie } from 'elysia';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { UsersTable } from '../../drizzle/schema';
import { verifyJWT } from '../shared/jwt';

export async function PubKeyGet(auth: Cookie<string | undefined>) {
    const publicKey = await verifyJWT(auth.value);
    if (typeof publicKey === 'undefined') {
        return { status: 401, error: 'Unauthorized token proivided' };
    }

    try {
        const rows = await getDatabase().select().from(UsersTable).where(eq(UsersTable.address, publicKey));
        console.log(rows);
        return { status: 200, rows };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to remove key from user' };
    }
}
