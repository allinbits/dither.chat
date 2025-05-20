import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

const doesPostExistStatement = getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, sql.placeholder('post_hash'))).prepare('stmnt_get_post_by_hash');

export function useSharedQueries() {
    const doesPostExist = async (post_hash: string) => {
        try {
            const results = await doesPostExistStatement.execute({ post_hash });
            return results.length >= 1 ? { status: 200 } : { status: 404 };
        } catch(err) {
            console.error(err);
            return { status: 500 }
        }
    };

    return {
        doesPostExist,
    };
}
