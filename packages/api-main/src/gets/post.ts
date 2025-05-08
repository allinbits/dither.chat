import { and, eq, sql } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

export const PostQuery = t.Object({
    hash: t.String(),
    post_hash: t.Optional(t.String()),
});

const statementGetPost = getDatabase()
    .select()
    .from(FeedTable)
    .where(eq(FeedTable.hash, sql.placeholder('hash')))
    .prepare('stmnt_get_post');

const statementGetReply = getDatabase()
    .select()
    .from(FeedTable)
    .where(and(eq(FeedTable.hash, sql.placeholder('hash')), eq(FeedTable.post_hash, sql.placeholder('post_hash'))))
    .prepare('stmnt_get_reply');

export async function Post(query: typeof PostQuery.static) {
    try {
        if (query.post_hash) {
            const result = await statementGetReply.execute({ hash: query.hash, post_hash: query.post_hash });
            return { status: 200, row: result };
        }
        const result = await statementGetPost.execute({ hash: query.hash });
        return { status: 200, row: result };
    }
    catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
