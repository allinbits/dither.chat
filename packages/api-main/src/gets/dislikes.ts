import { t } from 'elysia';
import { DislikesTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { eq } from 'drizzle-orm';
import { getJsonbArrayCount } from '../utility';

export const DislikesQuery = t.Object({
    hash: t.String(),
    count: t.Optional(t.Boolean()),
});

export async function Dislikes(query: typeof DislikesQuery.static) {
    if (!query.hash) {
        return {
            status: 400,
            error: 'malformed query, no hash provided',
        };
    }

    try {
        if (query.count) {
            return await getJsonbArrayCount(query.hash, DislikesTable._.name);
        }

        return await db.select().from(DislikesTable).where(eq(DislikesTable.hash, query.hash));
    } catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}
