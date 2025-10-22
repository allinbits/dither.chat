import type { Gets } from '@atomone/dither-api-types';

import { and, eq, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

const statementGetPost = getDatabase()
  .select()
  .from(FeedTable)
  .where(and(isNull(FeedTable.removed_at), eq(FeedTable.hash, sql.placeholder('hash'))))
  .prepare('stmnt_get_post');

const statementGetReply = getDatabase()
  .select()
  .from(FeedTable)
  .where(and(isNull(FeedTable.removed_at), eq(FeedTable.hash, sql.placeholder('hash')), eq(FeedTable.post_hash, sql.placeholder('post_hash'))))
  .prepare('stmnt_get_reply');

export async function Post(query: typeof Gets.PostQuery.static) {
  try {
    if (query.post_hash) {
      const results = await statementGetReply.execute({ hash: query.hash, post_hash: query.post_hash });
      return results.length <= 0 ? { status: 404, rows: [] } : { status: 200, rows: results };
    }

    const results = await statementGetPost.execute({ hash: query.hash });
    return results.length <= 0 ? { status: 404, rows: [] } : { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 400, error: 'failed to read data from database' };
  }
}
