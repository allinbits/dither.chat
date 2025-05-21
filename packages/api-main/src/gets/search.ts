import { type Gets } from '@atomone/dither-api-types';
import { desc, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

export async function Search(query: typeof Gets.SearchQuery.static) {
    try {
        const processedQuery = query.text
            .trim()
            .split(/\s+/)
            .filter((w: string) => w.length > 0)
            .map((w: string) => `${w}:*`)
            .join(' & ');

        if (!processedQuery) {
            return [];
        }

        const results = await getDatabase()
            .select()
            .from(FeedTable)
            .where(sql`to_tsvector('english', ${FeedTable.message}) @@ to_tsquery('english', ${processedQuery})`).limit(100).offset(0).orderBy(desc(FeedTable.timestamp)).execute();

        return { status: 200, rows: [...results] };
    }
    catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
