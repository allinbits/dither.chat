import type { Gets } from '@atomone/dither-api-types';

import { and, desc, eq, getTableColumns, gte, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, HandleTable } from '../../drizzle/schema';

export async function Search(query: Gets.SearchQuery) {
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
      .leftJoin(HandleTable, eq(FeedTable.author, HandleTable.address))
      .where(
        and(
          or(
            eq(FeedTable.author, query.text.toLowerCase()), // Exact address
            ilike(HandleTable.name, `%${query.text}%`), // Registered handle (partial match)
          ),
          isNull(FeedTable.removed_at),
        ),
      );
    const matchedAuthorAddresses = matchedAuthors.map(a => a.author);

    const matchedPosts = await getDatabase()
      .select({
        ...getTableColumns(FeedTable),
        handle: HandleTable.name,
      })
      .from(FeedTable)
      .leftJoin(HandleTable, eq(FeedTable.author, HandleTable.address))
      .where(
        and(
          or(
            sql`to_tsvector('english', ${FeedTable.message}) @@ to_tsquery('english', ${processedQuery})`,
            inArray(FeedTable.author, matchedAuthorAddresses),
          ),
          gte(sql`CAST(${FeedTable.quantity} AS NUMERIC)`, sql`CAST(${minQuantity} AS NUMERIC)`),
          isNull(FeedTable.removed_at),
        ),
      )
      .limit(100)
      .offset(0)
      .orderBy(desc(FeedTable.timestamp));

    return { status: 200, rows: [...matchedPosts], users: matchedAuthorAddresses };
  } catch (error) {
    console.error(error);
    return { status: 400, error: 'failed to read data from database' };
  }
}
