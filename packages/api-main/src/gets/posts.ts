import type { Gets } from '@atomone/dither-api-types';

import { and, desc, eq, getTableColumns, gte, inArray, isNull, sql } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, FollowsTable, RepostsTable } from '../../drizzle/schema';

const feedColumns = getTableColumns(FeedTable);

const statement = getDatabase()
  .select()
  .from(FeedTable)
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

function createPostsQuery(db: ReturnType<typeof getDatabase>, author: string, minQuantity: string) {
  return db
    .select({
      ...feedColumns,
      effective_timestamp: FeedTable.timestamp,
      reposted_by: sql<string | null>`null`,
      reposted_at: sql<Date | null>`null`,
    })
    .from(FeedTable)
    .where(
      and(
        eq(FeedTable.author, author),
        isNull(FeedTable.removed_at),
        isNull(FeedTable.post_hash),
        gte(sql`CAST(${FeedTable.quantity} AS NUMERIC)`, sql`CAST(${minQuantity} AS NUMERIC)`),
      ),
    );
}

function createRepostsQuery(db: ReturnType<typeof getDatabase>, author: string) {
  return db
    .select({
      ...feedColumns,
      effective_timestamp: RepostsTable.timestamp,
      reposted_by: RepostsTable.author,
      reposted_at: RepostsTable.timestamp,
    })
    .from(RepostsTable)
    .innerJoin(FeedTable, eq(FeedTable.hash, RepostsTable.post_hash))
    .where(
      and(
        eq(RepostsTable.author, author),
        isNull(FeedTable.removed_at),
      ),
    );
}

export async function Posts(query: Gets.PostsQuery) {
  let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
  const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;
  const minQuantity = typeof query.minQuantity !== 'undefined' ? query.minQuantity : '0';
  const withReposts = query.withReposts === true;

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
    if (!withReposts) {
      const results = await statement.execute({ author: query.address, limit, offset, minQuantity });
      return { status: 200, rows: results };
    }

    const db = getDatabase();
    const postsQuery = createPostsQuery(db, query.address, minQuantity);
    const repostsQuery = createRepostsQuery(db, query.address);

    const results = await unionAll(postsQuery, repostsQuery)
      .orderBy(desc(sql`effective_timestamp`))
      .limit(limit)
      .offset(offset);

    return { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 404, error: 'failed to find matching posts' };
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
