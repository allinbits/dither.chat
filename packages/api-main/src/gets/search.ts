import type { Gets } from '@atomone/dither-api-types';
import { and, desc, gte, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

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

    const minQuantity = typeof query.minQuantity !== 'undefined' ? query.minQuantity : '0';
    const matchedAuthors = await getDatabase()
      .selectDistinct({ author: FeedTable.author })
      .from(FeedTable)
      .where(and(ilike(FeedTable.author, `%${query.text}%`), isNull(FeedTable.removed_at)));
    const matchedAuthorAddresses = matchedAuthors.map(a => a.author);

    const matchedPosts = await getDatabase()
      .select()
      .from(FeedTable)
      .where(
        and(
          or(
            sql`to_tsvector('english', ${FeedTable.message}) @@ to_tsquery('english', ${processedQuery})`,
            inArray(FeedTable.author, matchedAuthorAddresses),
          ),
          gte(FeedTable.quantity, minQuantity),
          isNull(FeedTable.removed_at),
        ),
      )
      .limit(100)
      .offset(0)
      .orderBy(desc(FeedTable.timestamp))
      .execute();
    return { status: 200, rows: [...matchedPosts], users: matchedAuthorAddresses };
  } catch (error) {
    console.error(error);
    return { status: 400, error: 'failed to read data from database' };
  }
}
