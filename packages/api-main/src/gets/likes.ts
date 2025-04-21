import { t } from 'elysia';
import { LikesTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { eq } from 'drizzle-orm';

export const LikesQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
    isReply: t.Optional(t.String()),
});

export async function Likes(query: typeof LikesQuery.static) {
    let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
    let offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;

    if (limit > 100) {
        limit = 100;
    }

    if (limit <= 0) {
        return { status: 400, error: 'limit must be at least 1' };
    }

    if (offset < 0) {
        return { status: 400, error: 'offset must be at least 0' };
    }

    try {
        return await db.select().from(LikesTable).where(eq(LikesTable.hash, query.hash));
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching likes' };
    }
}
