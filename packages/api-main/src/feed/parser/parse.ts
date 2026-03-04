import type { FeedQuery, Filter, SortField } from '../types';
import type { Operator } from './operators';

import qs from 'qs';

import { isOperator } from './operators';
import { parseVariable } from './variables';

/**
 * Parse a query string into a FeedQuery AST
 */
export function parse(queryString: string): FeedQuery {
  const parsed = qs.parse(queryString);

  const query: FeedQuery = {
    filters: [],
    sort: [],
    includes: {},
  };

  for (const [key, value] of Object.entries(parsed)) {
    switch (key) {
      case 'sort':
        query.sort = parseSort(value);
        break;
      case 'timeframe':
        query.timeframe = parseTimeframe(value);
        break;
      case 'include':
        query.includes = parseIncludes(value);
        break;
      default:
        query.filters.push(...parseFilters(key, value));
    }
  }

  return query;
}

/**
 * Parse sort parameter: "-timestamp,likes" -> [{ field: 'timestamp', direction: 'desc' }, ...]
 */
function parseSort(value: unknown): SortField[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value.split(',').map((part) => {
    const isDesc = part.startsWith('-');
    return {
      field: isDesc ? part.substring(1) : part,
      direction: isDesc ? 'desc' : 'asc',
    };
  });
}

/**
 * Parse timeframe parameter: "24h", "7d", etc.
 */
function parseTimeframe(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * Parse include parameter: { reposts: 'true', replies: 'true' }
 */
function parseIncludes(value: unknown): FeedQuery['includes'] {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const includes = value as Record<string, string>;
  return {
    reposts: includes.reposts === 'true' || undefined,
    replies: includes.replies === 'true' || undefined,
    posts: includes.posts === 'true' || undefined,
  };
}

/**
 * Parse a field's filter value(s) into Filter objects
 */
function parseFilters(field: string, value: unknown): Filter[] {
  // Object with operators: author[$in]=a,b -> { author: { $in: 'a,b' } }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return parseOperatorFilters(field, value as Record<string, unknown>);
  }

  // Simple equality: author=addr -> { author: 'addr' }
  if (typeof value === 'string') {
    return [{
      field,
      operator: '$eq',
      value: parseVariable(value),
    }];
  }

  return [];
}

/**
 * Parse operator-based filters: { $in: 'a,b', $gte: '10' }
 */
function parseOperatorFilters(field: string, operators: Record<string, unknown>): Filter[] {
  const filters: Filter[] = [];

  for (const [op, val] of Object.entries(operators)) {
    if (!isOperator(op)) {
      continue;
    }

    filters.push({
      field,
      operator: op as Operator,
      value: parseFilterValue(val),
    });
  }

  return filters;
}

/**
 * Parse a filter value, resolving any variable references
 */
function parseFilterValue(val: unknown): Filter['value'] {
  if (typeof val === 'string') {
    return parseVariable(val);
  }

  if (Array.isArray(val)) {
    return val.map(v => typeof v === 'string' ? parseVariable(v) : v);
  }

  return val as Filter['value'];
}
