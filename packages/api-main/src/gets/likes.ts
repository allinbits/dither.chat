import { t } from 'elysia';
import { LikesTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { eq } from 'drizzle-orm';
import { getJsonbArrayCount } from '../utility';

export const LikesQuery = t.Object({
    hash: t.String(),
    count: t.Optional(t.Boolean()),
});

export async function Likes(query: typeof LikesQuery.static) {
    try {
        if (query.count) {
            return await getJsonbArrayCount(query.hash, LikesTable._.name);
        }

        return await db.select().from(LikesTable).where(eq(LikesTable.hash, query.hash));
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching likes' };
    }
}
