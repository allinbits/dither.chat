import type { Posts } from '@atomone/dither-api-types';
import { and, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable } from '../../drizzle/schema';
import { isReaderAuthorizationValid } from '../utility';

const statementRemoveFollowing = getDatabase()
  .update(FollowsTable)
  .set({ removed_at: sql.placeholder('removed_at') as never }) // Drizzle Type Issue atm.
  .where(
    and(
      eq(FollowsTable.follower, sql.placeholder('follower')),
      eq(FollowsTable.following, sql.placeholder('following')),
    ),
  )
  .prepare('stmnt_remove_follower');

export async function Unfollow(body: typeof Posts.UnfollowBody.static, headers: Record<string, string | undefined>) {
  if (!isReaderAuthorizationValid(headers)) {
    return { status: 401, error: 'Unauthorized to make write request' };
  }

  try {
    await statementRemoveFollowing.execute({ follower: body.from.toLowerCase(), following: body.address.toLowerCase(), removed_at: new Date(body.timestamp) });
    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 200, error: 'failed to unfollow user, user may not exist' };
  }
}
