import type { AnyColumn, SQL } from 'drizzle-orm';

import type { Filter } from '../types';

import { eq, getTableColumns, gt, gte, inArray, lt, lte, notInArray, sql } from 'drizzle-orm';

import { FeedTable } from '../../../drizzle/schema';
import { buildSearch } from './search';
import { resolveVariable } from './variables';

// Fields stored as TEXT but containing BigInt numbers - need numeric CAST for comparisons
const NUMERIC_TEXT_FIELDS = new Set(['quantity', 'likes_burnt', 'dislikes_burnt', 'flags_burnt']);

// Get valid columns directly from the schema - stays in sync automatically
const feedColumns = getTableColumns(FeedTable);

function isValidFilterField(field: string): boolean {
  return field in feedColumns;
}

export function buildFilter(filter: Filter, auth?: { address: string }): SQL | undefined {
  // Validate field name against schema columns
  if (!isValidFilterField(filter.field)) {
    console.warn(`Invalid filter field rejected: ${filter.field}`);
    return undefined;
  }

  if (filter.operator === '$search') {
    // Only 'message' field supports full-text search
    if (filter.field !== 'message') {
      return undefined;
    }
    return buildSearch(filter.value as string | string[]);
  }

  const col = feedColumns[filter.field as keyof typeof feedColumns];
  if (!col) return undefined;
  const dbCol = col as AnyColumn;

  let value: any = filter.value;

  if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'variable') {
    value = resolveVariable(value, auth);
  } else if (Array.isArray(value)) {
    // Handle array of values (potentially mixed with variables, though unlikely in current spec)
    // Drizzle inArray expects array of primitives or a subquery.
    // If we have an array of variables, we'd need to resolve them.
    // But currently $following is a single variable representing a set.
  }

  if (value === null || value === undefined) {
    // If value resolution failed (e.g. invalid variable), we might want to return undefined or specific error.
    // For now, let's treat as undefined filter.
    return undefined;
  }

  switch (filter.operator) {
    case '$eq': return eq(dbCol, value);
    case '$in': return inArray(dbCol, value);
    case '$nin': return notInArray(dbCol, value);
    case '$gte':
      if (NUMERIC_TEXT_FIELDS.has(filter.field)) {
        return gte(sql`CAST(${dbCol} AS NUMERIC)`, sql`CAST(${value} AS NUMERIC)`);
      }
      return gte(dbCol, value);
    case '$lte':
      if (NUMERIC_TEXT_FIELDS.has(filter.field)) {
        return lte(sql`CAST(${dbCol} AS NUMERIC)`, sql`CAST(${value} AS NUMERIC)`);
      }
      return lte(dbCol, value);
    case '$gt':
      if (NUMERIC_TEXT_FIELDS.has(filter.field)) {
        return gt(sql`CAST(${dbCol} AS NUMERIC)`, sql`CAST(${value} AS NUMERIC)`);
      }
      return gt(dbCol, value);
    case '$lt':
      if (NUMERIC_TEXT_FIELDS.has(filter.field)) {
        return lt(sql`CAST(${dbCol} AS NUMERIC)`, sql`CAST(${value} AS NUMERIC)`);
      }
      return lt(dbCol, value);
  }

  return undefined;
}
