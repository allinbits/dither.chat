export interface FeedQuery {
  filters: Filter[];
  sort: SortField[];
  includes: { reposts?: boolean; replies?: boolean; posts?: boolean };
  timeframe?: string;
}

export interface Filter {
  field: string;
  operator: '$eq' | '$in' | '$nin' | '$search' | '$gte' | '$lte' | '$gt' | '$lt';
  value: string | string[] | Variable;
}

export interface Variable {
  type: 'variable';
  name: '$me' | '$following';
}

export interface SortField {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FeedConfig {
  slug: string;
  name: string;
  description?: string;
  query: string;
}
