import { eq, sql } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

export const PostParams = t.Object({
    id: t.Integer(),
});

const statement = getDatabase()
    .select()
    .from(FeedTable)
    .where(eq(FeedTable.id, sql.placeholder('id')))
    .prepare('stmnt_get_feed_row');

export async function Post(params: typeof PostParams.static) {
    try {
        const result = await statement.execute({ id: params.id });
        return { status: 200, row: result };
    }
    catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
