import type { FeedQuery } from '../types';

import { builder, parser } from '../index';
import { retrieveFeedQuery } from './lookup';

// Maximum allowed offset to prevent resource exhaustion from deep pagination
const MAX_OFFSET = 10000;

interface ExecuteOptions {
  limit?: number;
  offset?: number;
  minQuantity?: string;
}

export async function execute(slug: string, auth?: { address: string }, options?: ExecuteOptions) {
  const queryString = await retrieveFeedQuery(slug);
  if (!queryString) {
    return { status: 404, error: 'Feed not found' };
  }

  const offset = options?.offset ?? 0;

  if (offset > MAX_OFFSET) {
    return { status: 400, error: `Offset exceeds maximum allowed value of ${MAX_OFFSET}` };
  }

  let ast: FeedQuery;
  try {
    ast = parser.parse(queryString);
  } catch (e) {
    console.error('Feed parse error', e);
    return { status: 500, error: 'Invalid feed query definition' };
  }

  // Inject minQuantity filter if provided and not already in query
  if (options?.minQuantity) {
    const hasQuantityFilter = ast.filters.some(f => f.field === 'quantity');
    if (!hasQuantityFilter) {
      ast.filters.push({
        field: 'quantity',
        operator: '$gte',
        value: options.minQuantity,
      });
    }
  }

  const query = builder.build(ast, auth);

  const limit = options?.limit ?? 100;

  query.limit(limit).offset(offset);

  try {
    const rows = await query.execute();
    return { status: 200, rows };
  } catch (e) {
    console.error('Feed execution error', e);
    return { status: 500, error: 'Failed to execute feed' };
  }
}
