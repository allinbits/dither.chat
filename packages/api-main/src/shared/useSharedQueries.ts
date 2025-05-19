import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

const doesPostExistStatement = getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, sql.placeholder('post_hash'))).prepare('stmnt_get_post_by_hash');

export function useSharedQueries() {
    const doesPostExist = async (post_hash: string) => {
        const results = await doesPostExistStatement.execute({ post_hash });
        return results.length >= 1;
    };

    return {
        doesPostExist,
    };
}
