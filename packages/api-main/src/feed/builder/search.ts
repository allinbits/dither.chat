import { sql } from 'drizzle-orm';

import { FeedTable } from '../../../drizzle/schema';

/**
 * Build a full-text search condition using plainto_tsquery.
 *
 * For multiple terms, we create OR conditions with individual plainto_tsquery
 * calls to maintain the "any of these terms" behavior.
 */
export function buildSearch(terms: string | string[]) {
  let termList: string[] = [];
  if (Array.isArray(terms)) {
    termList = terms;
  } else {
    termList = terms.split(',').map(t => t.trim());
  }

  // Filter out empty terms
  termList = termList.filter(t => t.length > 0);

  if (termList.length === 0) return undefined;

  // For a single term, use plainto_tsquery directly
  if (termList.length === 1) {
    return sql`to_tsvector('english', ${FeedTable.message}) @@ plainto_tsquery('english', ${termList[0]})`;
  }

  // For multiple terms, create OR conditions with individual plainto_tsquery calls
  const conditions = termList.map(term =>
    sql`to_tsvector('english', ${FeedTable.message}) @@ plainto_tsquery('english', ${term})`,
  );

  return sql`(${sql.join(conditions, sql` OR `)})`;
}
