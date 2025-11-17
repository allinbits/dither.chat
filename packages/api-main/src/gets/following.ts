import type { Gets } from '@atomone/dither-api-types';

import { and, desc, eq, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable, HandleTable } from '../../drizzle/schema';

const statementGetFollowing = getDatabase()
  .select({
    address: FollowsTable.following,
    handle: HandleTable.name,
    display: HandleTable.display,
    hash: FollowsTable.hash,
  })
  .from(FollowsTable)
  .leftJoin(HandleTable, eq(HandleTable.address, FollowsTable.follower))
  .where(and(eq(FollowsTable.follower, sql.placeholder('follower')), isNull(FollowsTable.removed_at)))
  .limit(sql.placeholder('limit'))
  .offset(sql.placeholder('offset'))
  .orderBy(desc(FollowsTable.timestamp))
  .prepare('stmnt_get_following');

export async function Following(query: Gets.FollowingQuery) {
  let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
  const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;

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
    const results = await statementGetFollowing.execute({ follower: query.address, limit, offset });
    return { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 404, error: 'failed to find matching following' };
  }
}
