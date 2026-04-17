import type { AnyColumn } from 'drizzle-orm';

import type { SortField } from '../types';

import { asc, desc, getTableColumns } from 'drizzle-orm';

import { FeedTable } from '../../../drizzle/schema';

// Get valid columns directly from the schema - stays in sync automatically
const feedColumns = getTableColumns(FeedTable);

function isValidSortField(field: string): field is keyof typeof feedColumns {
  return field in feedColumns;
}

/**
 * Build sort conditions for the feed query.
 * Filters out any invalid sort fields.
 * Returns an array of Drizzle ORM order by conditions.
 */
export function buildSort(sorts: SortField[]) {
  return sorts.map((s) => {
    if (!isValidSortField(s.field)) {
      console.warn(`Invalid sort field rejected: ${s.field}`);
      return null;
    }

    const col = feedColumns[s.field] as AnyColumn;
    return s.direction === 'asc' ? asc(col) : desc(col);
  }).filter((s): s is NonNullable<typeof s> => s !== null);
}
