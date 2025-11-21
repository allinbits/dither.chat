import type { Gets } from '@atomone/dither-api-types';

import { and, count, desc, eq, getTableColumns, gte, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable, FeedTable } from '../../drizzle/schema';

const statement = getDatabase()
  .select({
    ...getTableColumns(FeedTable),
    handle: AccountTable.handle,
    display: AccountTable.display,
  })
  .from(FeedTable)
  .leftJoin(AccountTable, eq(FeedTable.author, AccountTable.address))
  .limit(sql.placeholder('limit'))
  .offset(sql.placeholder('offset'))
  .where(
    and(
      isNull(FeedTable.removed_at),
      isNull(FeedTable.post_hash),
      gte(sql`CAST(${FeedTable.quantity} AS NUMERIC)`, sql`CAST(${sql.placeholder('minQuantity')} AS NUMERIC)`),
    ),
  )
  .orderBy(desc(FeedTable.timestamp))
  .prepare('stmnt_get_feed');

export async function Feed(query: Gets.FeedQuery) {
  if (query.count) {
    try {
      return await getDatabase().select({ count: count() }).from(FeedTable);
    } catch (err) {
      console.error(err);
      return { status: 400, error: 'failed to read data from database' };
    }
  }

  let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
  const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;
  const minQuantity = typeof query.minQuantity !== 'undefined' ? query.minQuantity : '0';

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
    const results = await statement.execute({ offset, limit, minQuantity });
    return { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 400, error: 'failed to read data from database' };
  }
}
