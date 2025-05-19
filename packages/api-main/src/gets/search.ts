import { type Gets } from '@atomone/dither-api-types';
import { desc, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

export async function Search(query: typeof Gets.SearchQuery.static) {
    try {
        const results = await getDatabase()
            .select()
            .from(FeedTable)
            .where(sql`to_tsvector('english', ${FeedTable.message}) @@ websearch_to_tsquery('english', ${query.text})`).limit(100).offset(0).orderBy(desc(FeedTable.timestamp)).execute();

        return results.length <= 0 ? { status: 404, rows: [] } : { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
