import type { Gets } from '@atomone/dither-api-types';
import { and, eq, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable } from '../../drizzle/schema';

const statementIsFollowing = getDatabase()
  .select()
  .from(FollowsTable)
  .where(
    and(
      eq(FollowsTable.following, sql.placeholder('following')),
      eq(FollowsTable.follower, sql.placeholder('follower')),
      isNull(FollowsTable.removed_at),
    ),
  )
  .limit(1)
  .prepare('stmnt_is_following');

export async function IsFollowing(query: typeof Gets.IsFollowingQuery.static) {
  try {
    const results = await statementIsFollowing.execute({ following: query.following, follower: query.follower });
    if (results.length <= 0) {
      return { status: 404, error: 'user is not following' };
    }
    return { status: 200, rows: results };
  } catch (error) {
    console.error(error);
    return { status: 404, error: 'user is not following' };
  }
}
