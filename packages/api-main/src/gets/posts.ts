import { t } from 'elysia';
import { FeedTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { eq } from 'drizzle-orm';

export const PostsQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    address: t.String(),
});

export async function Posts(query: typeof PostsQuery.static) {
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
        return await db.select().from(FeedTable).where(eq(FeedTable.author, query.address)).limit(limit).offset(offset);
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching reply' };
    }
}
