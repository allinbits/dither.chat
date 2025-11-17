import type { Gets } from '@atomone/dither-api-types';

import { and, desc, eq, getTableColumns, gte, inArray, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, FollowsTable, HandleTable } from '../../drizzle/schema';

const statement = getDatabase()
  .select({
    ...getTableColumns(FeedTable),
    handle: HandleTable.name,
  })
  .from(FeedTable)
  .leftJoin(HandleTable, eq(FeedTable.author, HandleTable.address))
  .where(
    and(
      eq(FeedTable.author, sql.placeholder('author')),
      isNull(FeedTable.removed_at),
      isNull(FeedTable.post_hash), // Do not return replies
      gte(sql`CAST(${FeedTable.quantity} AS NUMERIC)`, sql`CAST(${sql.placeholder('minQuantity')} AS NUMERIC)`),
    ),
  )
  .limit(sql.placeholder('limit'))
  .offset(sql.placeholder('offset'))
  .orderBy(desc(FeedTable.timestamp))
  .prepare('stmnt_get_posts');

export async function Posts(query: Gets.PostsQuery) {
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
    const results = await statement.execute({ author: query.address, limit, offset, minQuantity });
    return { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 404, error: 'failed to find matching reply' };
  }
}

const followingPostsStatement = getDatabase()
  .select()
  .from(FeedTable)
  .where(
    and(
      inArray(FeedTable.author, getDatabase()
        .select({ following: FollowsTable.following })
        .from(FollowsTable)
        .where(and(eq(FollowsTable.follower, sql.placeholder('address')), isNull(FollowsTable.removed_at)))),
      isNull(FeedTable.post_hash),
      isNull(FeedTable.removed_at),
      gte(sql`CAST(${FeedTable.quantity} AS NUMERIC)`, sql`CAST(${sql.placeholder('minQuantity')} AS NUMERIC)`),
    ),
  )
  .orderBy(desc(FeedTable.timestamp))
  .limit(sql.placeholder('limit'))
  .offset(sql.placeholder('offset'))
  .prepare('stmnt_posts_from_following');

export async function FollowingPosts(query: Gets.PostsQuery) {
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
    const results = await followingPostsStatement.execute({ address: query.address, limit, offset, minQuantity });
    return { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 404, error: 'failed to posts from followed users' };
  }
}
