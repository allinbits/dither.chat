import type { FeedQuery } from '../types';

import { and, isNull } from 'drizzle-orm';

import { getDatabase } from '../../../drizzle/db';
import { FeedTable } from '../../../drizzle/schema';
import { buildFilter } from './filters';
import { buildSort } from './sort';
import { buildTimeframe } from './timeframe';

export function build(ast: FeedQuery, auth?: { address: string }) {
  const conditions = [];

  conditions.push(isNull(FeedTable.removed_at));

  if (!ast.includes?.replies) {
    conditions.push(isNull(FeedTable.post_hash));
  }

  for (const filter of ast.filters) {
    const cond = buildFilter(filter, auth);
    if (cond) conditions.push(cond);
  }

  if (ast.timeframe) {
    const cond = buildTimeframe(ast.timeframe);
    if (cond) conditions.push(cond);
  }

  const orderBy = buildSort(ast.sort);

  const q = getDatabase()
    .select()
    .from(FeedTable)
    .where(and(...conditions));

  if (orderBy.length > 0) {
    return q.orderBy(...orderBy);
  }

  return q;
}
