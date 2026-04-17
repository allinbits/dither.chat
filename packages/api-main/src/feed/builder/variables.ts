import type { Variable } from '../types';

import { and, desc, eq, isNull } from 'drizzle-orm';

import { getDatabase } from '../../../drizzle/db';
import { FollowsTable } from '../../../drizzle/schema';

// Maximum number of followed accounts to include in subquery
// Prevents unbounded result sets that could cause performance issues
const MAX_FOLLOWING_LIMIT = 1000;

export function resolveVariable(variable: Variable, auth?: { address: string }) {
  if (variable.name === '$following') {
    if (!auth?.address) throw new Error('Authentication required for $following');
    const db = getDatabase();
    return db.select({ following: FollowsTable.following })
      .from(FollowsTable)
      .where(and(
        eq(FollowsTable.follower, auth.address),
        isNull(FollowsTable.removed_at),
      ))
      .orderBy(desc(FollowsTable.timestamp))
      .limit(MAX_FOLLOWING_LIMIT);
  }

  if (variable.name === '$me') {
    if (!auth?.address) throw new Error('Authentication required for $me');
    return auth.address;
  }

  return null;
}
